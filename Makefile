#
# DemocracyOS Makefile
#

ifndef DEBUG
	DEBUG="manager*"
endif

ifndef NODE_ENV
	NODE_ENV="development"
endif

run: packages
	@echo "Starting application..."
	@NODE_PATH=. DEBUG=$(DEBUG) node index.js

packages:
	@echo "Installing dependencies..."
	@npm install

clean:
	@echo "Removing dependencies, components and built assets."
	@rm -rf node_modules
	@echo "Done.\n"


.PHONY: clean
