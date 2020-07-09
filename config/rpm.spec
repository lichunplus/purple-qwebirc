Name:		%{pkgname}
Version:	%{pkgversion}
Release:	%{pkgrelease}
Summary:	A part of Purple Project
License:	LGPLv2+

Requires: python

%description
A part of Purple Project

%prep
#Normally this involves unpacking the sources and applying any patches.

%build
#This generally involves the equivalent of a "make".

%install
#This generally involves the equivalent of a "make install".
cp -rf %{rootfs}/* $RPM_BUILD_ROOT/

%check

%pre
getent group purple >/dev/null || groupadd -f -r purple
if ! getent passwd qwebirc >/dev/null; then
  useradd -r -g qwebirc -G purple -d / -s /sbin/nologin -c "qwebirc user" qwebirc
fi
exit 0

%post
%systemd_post qwebirc.service
/bin/systemctl enable qwebirc.service >/dev/null 2>&1
/bin/systemctl start qwebirc.service >/dev/null 2>&1

%preun
%systemd_preun qwebirc.service

#postun
/bin/systemctl daemon-reload >/dev/null 2>&1 || :
if [ $1 -ge 1 ] ; then
    /bin/systemctl try-restart qwebirc.service >/dev/null 2>&1 || :
fi

%clean

%files
%defattr(-,root,root,-)
%{_unitdir}/qwebirc.service
%{_usr}/local/*
