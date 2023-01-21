UpdateAndReset:
	@echo "Updating and resetting the repository..."
	@git reset --hard
	@git pull
	@echo "Done."
	@mv server/config/config_ibm.yaml server/config/config.yaml
	@echo cd server && yarn build