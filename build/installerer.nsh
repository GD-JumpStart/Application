!macro customInstall
  DetailPrint "Register jumpstart URI Handler"
  DeleteRegKey HKCR "jumpstart"
  WriteRegStr HKCR "jumpstart" "" "URL:jumpstart"
  WriteRegStr HKCR "jumpstart" "EveHQ NG SSO authentication Protocol" ""
  WriteRegStr HKCR "jumpstart\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "jumpstart\shell" "" ""
  WriteRegStr HKCR "jumpstart\shell\Open" "" ""
  WriteRegStr HKCR "jumpstart\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend