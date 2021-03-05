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
cp -r %{rootfs}/* $RPM_BUILD_ROOT/

%check

%pre

%post
%systemd_post qwebirc.service
/bin/systemctl enable qwebirc.service >/dev/null 2>&1
/bin/systemctl start qwebirc.service >/dev/null 2>&1

%preun
%systemd_preun qwebirc.service
rm -f %{_usr}/local/purple-qwebirc/twisted/plugins/dropin.cache 

#postun
/bin/systemctl daemon-reload >/dev/null 2>&1 || :
if [ $1 -ge 1 ] ; then
    /bin/systemctl try-restart qwebirc.service >/dev/null 2>&1 || :
fi

%clean

%files
%defattr(-,root,root,-)
%{_unitdir}/qwebirc.service
%dir %{_usr}/local/%{pkgname}
%{_usr}/local/%{pkgname}/*
