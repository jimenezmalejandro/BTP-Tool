function loadImages(name) {
  
  var folder = DriveApp.getFolderById('1t0jJF-76KSO7mUVBWQRs9HJtLz2EjiYd');
  var image = folder.getFilesByName(name);
  
  return image;
}
