# Manual Setup
Only use this guide if the client won't run setup properly.

## Setting Directories
You'll need the client open for this.
1. Press `Ctrl + Shift + I`
2. Select the `Console` tab
3. Type `storage.GDDIR = "{Your Geometry Dash Directory (e.g. C:/Program Files (x86)/Steam/steamapps/common/Geometry Dash)}"` (Make sure you replace all instances of "\" with "/")
4. Type `storage.GDEXE = "{Your Geometry Dash Executable (e.g. GeometryDash.exe)}"` (Make sure you replace all instances of "\\" with "/")

## Installing
All mentions of files will be in your Geometry Dash Directory.
1. Download https://cdn.discordapp.com/attachments/837026406282035300/859008315413626920/quickldr-v1.1.zip
2. Rename `libcurl.dll` to `libcurl.dll.bak` (used for restoring your original GD Installation)
3. Unpack `quickldr-v1.1.zip`
4. Create a `quickldr` folder
5. Create a `settings.txt` file inside of the `quickldr` folder
6. Download https://cdn.discordapp.com/attachments/837026406282035300/856484662028795924/minhook.x32.dll
7. Move `minhook.x32.dll` to your Geometry Dash Directory

## MegaHack Support
You'll need the client open for this
1. Press `Ctrl + Shift + I`
2. Select the `Console` tab
3. If you have MegaHack, type `storage.MHV7 = true`
4. Otherwise, type `storage.MHV7 = false`

## Installing Mods
This section is only for users who aren't using the client.
1. Open the `quickldr` folder
2. Move your selected mod file into the `quickldr` folder
3. In your `settings.txt` file inside of the `quickldr` folder, type the name of the mod. (e.g. GDShare-v0.3.4.dll)
