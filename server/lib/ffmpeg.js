// Class to handle child process used for running FFmpeg
import Logger from './logger/Logger';

const child_process = require('child_process');
const { EventEmitter } = require('events');
const { createSdpText } = require('./sdp');
const { convertStringToStream } = require('./utils');
const RECORD_FILE_LOCATION_PATH = process.env.RECORD_FILE_LOCATION_PATH || './files';
const FileType = require('file-type');
const logger = new Logger('Ffmpeg');

module.exports = class FFmpeg {
    constructor(rtpParameters, peer) {
        this._rtpParameters = rtpParameters;
        this._process = undefined;
        this._peer = peer;
        this._observer = new EventEmitter();
        this._createProcess();
    }

    _createProcess() {
        const sdpString = createSdpText(this._rtpParameters);
        const sdpStream = convertStringToStream(sdpString);

        logger.info('createProcess() [sdpString:%s]', sdpString);

        this._process = child_process.spawn('ffmpeg', this._commandArgs);

        if (this._process.stderr) {
            this._process.stderr.setEncoding('utf-8');

            this._process.stderr.on('data', data =>
                logger.info('process::stderr::data [data:%o]', data)
            );
        }

        if (this._process.stdout) {
            this._process.stdout.on('data', data => {
                (async (buffer) => {
                    try {
                        const fileType = await FileType.fromBuffer(buffer);
                        const isRawImage = fileType && (fileType.mime === 'image/jpeg' || fileType.mime === 'image/png');
                        if (isRawImage) {
                            logger.info('process::image Piped raw Image. [mime:%o]', fileType.mime);
                            this._peer.emit('rawImage', { buffer });
                        }
                        else {
                            logger.info('process::data [data:%o]', data);
                        }
                    } catch (err) {
                        logger.error('err', err);
                    }
                })(data);
            });

        }

        this._process.on('message', message =>
            logger.info('process::message [message:%o]', message)
        );

        this._process.on('error', error =>
            logger.error('[error:%o]', error)
        );

        this._process.once('close', () => {
            logger.info('process::close');
            this._observer.emit('process-close');
        });

        sdpStream.on('error', error =>
            logger.error('sdpStream::error [error:%o]', error)
        );

        // Pipe sdp stream to the ffmpeg process
        sdpStream.resume();
        sdpStream.pipe(this._process.stdin);
    }

    kill() {
        logger.info('kill() [pid:%d]', this._process.pid);
        this._process.kill('SIGINT');
    }

    get _commandArgs() {
        let commandArgs = [
            '-loglevel',
            'debug',
            '-protocol_whitelist',
            'pipe,udp,rtp',
            '-fflags',
            '+genpts',
            '-f',
            'sdp',
            '-i',
            'pipe:0'
        ];

        // commandArgs = commandArgs.concat(this._videoArgs);
        // commandArgs = commandArgs.concat(this._audioArgs);

        commandArgs = commandArgs.concat([
            /*
            '-flags',
            '+global_header',
            */
            // `${RECORD_FILE_LOCATION_PATH}/${this._rtpParameters.fileName}.webm`
            '-vf',
            'fps=1',
            '-f',
            // 'image2',
            'image2pipe',
            // '-update',
            // '1',
            // `${RECORD_FILE_LOCATION_PATH}/${this._rtpParameters.fileName}.jpg`
            '-'
        ]);

        logger.info('commandArgs:%o', commandArgs);

        return commandArgs;
    }

    get _videoArgs() {
        return [
            '-map',
            '0:v:0',
            '-c:v',
            'copy'
        ];
    }

    get _audioArgs() {
        return [
            '-map',
            '0:a:0',
            '-strict', // libvorbis is experimental
            '-2',
            '-c:a',
            'copy'
        ];
    }
}
