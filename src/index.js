import pdfjs from 'pdfjs-dist';

export default function (file) {
    const isFile = file instanceof File;

  if (isFile) {
    var fileReader = new FileReader();
    fileReader.onload = function(ev) {
      console.log('event', ev);
      var data = fileReader.result;
      pdfjs.getDocument(data).promise.then(function getPdfHelloWorld(pdf) {
        //
        // Fetch the first page
        //
        console.log('pdf', pdf)
        pdf.getPage(1).then(function getPageHelloWorld(page) {
          var scale = 1.5;
          var viewport = page.getViewport({scale: scale});

          //
          // Prepare canvas using PDF page dimensions
          //
          console.log('document', document);
          // var canvas = document.getElementById('the-canvas');
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          //
          // Render PDF page into canvas context
          //
          var task = page.render({canvasContext: context, viewport: viewport})
          task.promise.then(function(){
            // console.log(canvas.toDataURL('image/jpeg'));
            var img = document.createElement('img');
            img.src = canvas.toDataURL('image/jpeg');
            document.body.appendChild(img);
          });
        });
      }, function(error){
        console.log(error);
      });
    };
    fileReader.readAsArrayBuffer(file);
  }
}
