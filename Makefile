PURPLE_QWEBIRC_ROOT := ${CURDIR}
NAME := purple-qwebirc
VERSION := 0.0.0
RELEASE := 000

BUILD_DIR = ${PURPLE_QWEBIRC_ROOT}/build_dir/
ROOTFS = ${PURPLE_QWEBIRC_ROOT}/rootfs
RPMBUILD_DIR = ${PURPLE_QWEBIRC_ROOT}/rpmbuild
RPM_PKGNAME = $(NAME)-$(VERSION).rpm

all:
	@mkdir -p ${BUILD_DIR}
	@cp -r ./qwebirc-b13bdf3/* ${BUILD_DIR}
	@cp ./config/config.py ${BUILD_DIR}
	cd ${BUILD_DIR} && python2 compile.py 

help:
	@echo "Usage: make [-jN] [rpm]"
	@echo "       make clean"

rpm: all
	install -d -m 0755 ${ROOTFS}/usr/local/
	cp -r ${BUILD_DIR} ${ROOTFS}/usr/local/${NAME}
	install -d -m 0755 ${ROOTFS}/usr/lib/systemd/system
	cp ./config/qwebirc.service ${ROOTFS}/usr/lib/systemd/system/
	rpmbuild --define '_topdir     $(RPMBUILD_DIR)'                   \
             --define 'rootfs      $(ROOTFS)'                         \
             --define 'pkgname     $(NAME)'                           \
             --define 'pkgversion  $(VERSION)'                        \
             --define 'pkgrelease  $(RELEASE)'                        \
             -bb config/rpm.spec
	cp -rf $(RPMBUILD_DIR)/RPMS/x86_64/*.rpm $(RPM_PKGNAME)

clean:
	@rm -rf ${BUILD_DIR} ${ROOTFS} ${RPMBUILD_DIR}
	@rm -rf ${RPM_PKGNAME}

.PHONY: all help rpm clean
