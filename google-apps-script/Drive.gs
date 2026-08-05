/**
 * Drive.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * Google Drive integration for CDN media uploads, asset management, and folder sync
 */

var DriveService = {
  /**
   * Upload Base64 Image to Google Drive Folder & return view URL
   */
  uploadBase64Image: function(base64Data, fileName, mimeType) {
    try {
      var folderId = CONFIG.DRIVE_FOLDER_ID;
      var folder;
      
      if (folderId) {
        folder = DriveApp.getFolderById(folderId);
      } else {
        var folders = DriveApp.getFoldersByName("SDY_ENTERPRISE_ASSETS");
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder("SDY_ENTERPRISE_ASSETS");
        }
      }

      var cleanedBase64 = base64Data.replace(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/, "");
      var decoded = Utilities.base64Decode(cleanedBase64);
      var blob = Utilities.newBlob(decoded, mimeType || "image/jpeg", fileName || "sdy_upload_" + new Date().getTime() + ".jpg");
      
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return {
        success: true,
        fileId: file.getId(),
        fileName: file.getName(),
        url: file.getUrl(),
        downloadUrl: "https://lh3.googleusercontent.com/d/" + file.getId() + "=s1600"
      };
    } catch (e) {
      return {
        success: false,
        message: "Drive Upload Failed: " + e.message
      };
    }
  }
};
