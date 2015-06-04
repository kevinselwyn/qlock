NAME         := qlock
PACKAGE_DIR  := $(NAME).app/Contents
VERSION      := 0.9.2
NEW_APP_PATH := http://dl.node-webkit.org/v$(VERSION)/
NEW_APP      := node-webkit-v$(VERSION)-osx-ia32
PWD          := `pwd`
PLIST        := $(PWD)/build/mac/$(PACKAGE_DIR)/Info
APP_FILES    := index.html package.json style.css $(NAME)*.js themes.json sizes.json images

all:
	@echo "Specify which system you would like to build for: mac, linux"

mac: mac-package

linux: linux-package

mac-prepare:
	mkdir -p build/mac/
	if [ ! -d build/mac/$(NAME).app ] ; then \
		curl -O -L $(NEW_APP_PATH)/$(NEW_APP).zip ; \
		unzip $(NEW_APP).zip -d $(NEW_APP) ; \
		mv $(NEW_APP)/node-webkit.app build/mac/$(NAME).app ; \
		rm -r $(NEW_APP) $(NEW_APP).zip ; \
	fi

mac-icon:
	iconutil -c icns -o build/mac/$(PACKAGE_DIR)/Resources/nw.icns icon/nw.iconset

mac-package: mac-prepare mac-icon
	mkdir -p build/mac/$(PACKAGE_DIR)/Resources/app.nw
	cp -R $(APP_FILES) build/mac/$(PACKAGE_DIR)/Resources/app.nw
	defaults write $(PLIST) CFBundleDisplayName $(NAME)
	defaults write $(PLIST) CFBundleName $(NAME)

linux-package:
	mkdir -p build/linux/
	zip -r $(NAME).nw $(APP_FILES)
	cat /usr/bin/nw ./$(NAME).nw > build/linux/$(NAME)
	chmod +x build/linux/$(NAME)
	cp /usr/bin/nw.pak build/linux/
	rm $(NAME).nw

clean:
	sudo rm -r build $(NAME).nw