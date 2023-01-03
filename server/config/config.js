const userRoles = require('../lib/access/roles');

const {
	EMOTION_ANALYSIS
} = require('../lib/access/perms');


module.exports =
{
	
	auth :
	{
		// Auth strategy to use (default oidc)
		strategy : 'local',

		// to create password hash use: node server/utils/password_encode.js cleartextpassword
		local :
		{
			users : [
				{
					id           : 1,
					username     : 'alice',
					passwordHash : '$2b$10$OOd2ORYOFj9tIEdPHpcK/eUj732QBJ8Ja/OCWz3fjxy.Jcr11LzT.',
					displayName  : 'Alice',
					emails       : [ { value: 'alice@atlanta.com' } ],
					meetRoles   : [ ]
				},
				{
					id           : 2,
					username     : 'bob',
					passwordHash : '$2b$10$XdWz6Z/NoJMd06P/BgaEqu7ctDLsz/vDxXhEgSq9.wqcQ2uGemOgq',
					displayName  : 'Bob',
					emails       : [ { value: 'bob@biloxi.com' } ],
					meetRoles   : [ 'physician' ]
				}
			]
		}
	},

	// All authenticated users will be AUTHENTICATED,
	// and those with the moderator, meetingadmin, physician  role set in the userinfo
	// will also be MODERATOR, ADMIN, PHYSICIAN.
	userMapping : async ({ peer, room, roomId, userinfo }) =>
	{
		if (
			Array.isArray(userinfo.meetRoles) &&
			userinfo.meetRoles.includes('moderator')
		)
		{
			peer.addRole(userRoles.MODERATOR);
		}

		if (
			Array.isArray(userinfo.meetRoles) &&
			userinfo.meetRoles.includes('meetingadmin')
		)
		{
			peer.addRole(userRoles.ADMIN);
		}

		if (
			Array.isArray(userinfo.meetRoles) &&
			userinfo.meetRoles.includes('physician')
		)
		{
			peer.addRole(userRoles.PHYSICIAN);
		}		

		peer.addRole(userRoles.AUTHENTICATED);
	},
	permissionsFromRoles : {
		// The role(s) have permission to analyze emotions
		[EMOTION_ANALYSIS] : [ userRoles.PHYSICIAN ]
	},
};
