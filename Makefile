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

help:
	@echo "Usage: make [-jN] [rpm]"
	@echo "       make clean"

rpm: all
	mkdir -p ${ROOTFS}/usr/local/${NAME}
	cp -r ${BUILD_DIR}/* ${ROOTFS}/usr/local/${NAME}/
	mkdir -p ${ROOTFS}/usr/lib/systemd/system
	cp ./config/qwebirc.service ${ROOTFS}/usr/lib/systemd/system/
	rpmbuild --define '_topdir     $(RPMBUILD_DIR)'                   \
             --define 'rootfs      $(ROOTFS)'                         \
             --define 'pkgname     $(NAME)'                           \
             --define 'pkgversion  $(VERSION)'                        \
             --define 'pkgrelease  $(RELEASE)'                        \
             -bb config/rpm.spec
	cp $(RPMBUILD_DIR)/RPMS/x86_64/*.rpm $(RPM_PKGNAME)

clean:
	@rm -rf ${BUILD_DIR} ${ROOTFS} ${RPMBUILD_DIR}
	@rm -rf ${RPM_PKGNAME}

.PHONY: all help rpm clean
