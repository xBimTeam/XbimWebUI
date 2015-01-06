for %%f in (*.ifc) do (
..\..\..\XbimConvert\bin\Release\XbimConvert.exe %%f

del "%%~nf.xbim"
del "%%~nf.ifc.log"
)