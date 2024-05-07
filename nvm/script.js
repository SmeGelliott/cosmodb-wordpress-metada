function handleFileSelect(event) {
  event.stopPropagation();
  event.preventDefault();
  var files = event.target.files;
  handleFiles(files);
}

function handleDragOver(event) {
  event.stopPropagation();
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

function handleFileDrop(event) {
  event.stopPropagation();
  event.preventDefault();
  var files = event.dataTransfer.files;
  handleFiles(files);
}
// An array to keep track of file names already in progress
var filesInProgress = [];

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


function handleFiles(files) {
  document.getElementById('progress').style.display = 'block'; // Show progress bar after files are selected/dropped
  var uniqueId = uuid(); // Unique identifier for the progress bar

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var fileName = file.name+uniqueId;

    // Check if the file is already in progress
    //if (!filesInProgress.includes(fileName)) {
      // Add the file name to the array of files in progress
      filesInProgress.push(fileName);

      var progressListItem = document.createElement('div');
      progressListItem.setAttribute('data-file', fileName); // Set data-file attribute to associate with the file
      progressListItem.setAttribute('data-id', uniqueId); // Set data-id attribute for identification
      progressListItem.classList.add('progress-bar-container');
      progressListItem.innerHTML = '<div class="progress-header">' + fileName.split(uniqueId)[0] + '</div><div class="progress-wrapper"><progress id="' + uniqueId + '" value="0" max="100"></progress><span class="progress-label">0%</span></div>';
      document.getElementById('progress-list').appendChild(progressListItem);
    //}
  }
  uploadFiles(files, uniqueId);
}


function uploadFiles(files, uniqueId) {
  var fileName = files[0].name+uniqueId; 

  var formData = new FormData();
  for (var i = 0; i < files.length; i++) {
    formData.append('files[]', files[i]);
  }

  // Get the value of the override checkbox
  var override = document.getElementById('override').checked;

  // Append the override value to the form data
  formData.append('override', override);

  $.ajax({
    url: 'http://localhost/upload.php',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    xhr: function () {
      var xhr = new window.XMLHttpRequest();
      xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable) {
          var percentComplete = Math.round((e.loaded / e.total) * 100);
          var progressListItem = document.querySelector('.progress-bar-container[data-file="' + fileName + '"]');
          var progressBar = progressListItem.querySelector('progress');
          var progressLabel = progressListItem.querySelector('.progress-label');

          progressBar.value = percentComplete;
          progressLabel.textContent = percentComplete + '%';

          // Show "Uploaded" when progress reaches 100%
          if (percentComplete === 100) {
            progressLabel.textContent = 'Uploaded';
          }
        }
      }, false);
      
      return xhr;
    },
    success: function (response) {
      var progressListItem = document.querySelector('.progress-bar-container[data-file="' + fileName + '"]');
      var progressWrap = progressListItem.querySelector('.progress-wrapper');
      var progressBar = progressListItem.querySelector('progress');
      var progressLabel = progressListItem.querySelector('.progress-label');

      var jsonResponse = JSON.parse(response);

      if (jsonResponse.status === "success" && jsonResponse.messages.includes("Successful")) {
        // Add success class and remove error class
        progressBar.classList.add('progress-success');
        progressBar.classList.remove('progress-error');
        progressWrap.classList.remove('error');
        progressLabel.classList.add('label-error');
        progressLabel.textContent = 'Uploaded';
        progressLabel.classList.add('label-success');
        progressLabel.classList.remove('label-error');
      } else if (jsonResponse.status === "success" && jsonResponse.messages.includes("File already exists.")) {
        progressBar.classList.remove('progress-error');
        progressBar.classList.remove('progress-success');
        progressBar.classList.add('progress-default');
        progressLabel.textContent = 'exist!';
      }
      else {
        alert(jsonResponse.messages)
        // Add error class and remove success class
        progressBar.classList.add('progress-error');
        progressBar.classList.remove('progress-success');
        progressLabel.classList.add('label-error');
        progressLabel.classList.remove('label-success');
        progressLabel.textContent = 'Failed';
      }
      // Reset the file input after upload
      document.getElementById('fileInput').value = '';
    },
    error: function (xhr, status, error) {
      var progressListItem = document.querySelector('.progress-bar-container[data-file="' + fileName + '"]');
      var progressWrap = progressListItem.querySelector('.progress-wrapper');
      var progressLabel = progressListItem.querySelector('.progress-label');
    
      // Handle connection error
      alert("Connection error occurred. Please try again.");
      
      // Change progress bar to red
      progressWrap.classList.add('error');
      progressLabel.textContent = 'Failed';
    }
    
  });
}


function createProgressBar(file) {
  var progressListItem = document.createElement('div');
  progressListItem.classList.add('progress-bar-container');
  progressListItem.innerHTML = '<span>' + file.name + '</span><progress value="0" max="100"></progress>';
  document.getElementById('progress-list').appendChild(progressListItem);
  return progressListItem.querySelector('progress');
}

function createProgressHandler(progressElement) {
  return function(e) {
      if (e.lengthComputable) {
          var percentComplete = (e.loaded / e.total) * 100;
          progressElement.value = percentComplete;
      }
  };
}
