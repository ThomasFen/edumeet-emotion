UpdateAndReset:
	@echo "Updating and resetting the repository..."
	@git reset --hard
	@git pull
	@echo "Done."
	@mv server/config/config_ibm.yaml server/config/config.yaml
	@cd server && yarn build
	@cd server && DEBUG=${DEBUG:='*mediasoup* *INFO* *WARN* *ERROR*'} INTERACTIVE=${INTERACTIVE:='true'} yarn start server.js


UpdateAndResetWithApp:
	@echo "Updating and resetting the repository..."
	@git reset --hard
	@git pull
	@echo "Done."
	@mv server/config/config_ibm.yaml server/config/config.yaml
	@cd app && yarn build
	@cd server && yarn build
	@cd server && DEBUG=${DEBUG:='*mediasoup* *INFO* *WARN* *ERROR*'} INTERACTIVE=${INTERACTIVE:='true'} yarn start server.js