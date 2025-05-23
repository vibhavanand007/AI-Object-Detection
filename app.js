$(document).ready(function () {
    let selectedFile = null;

    const dropArea = $('#drop-area');

    // Highlight drag events
    dropArea.on('dragenter dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.addClass('highlight');
    });

    dropArea.on('dragleave dragend drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.removeClass('highlight');
    });

    // Drop file
    dropArea.on('drop', function (e) {
        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // File input change
    $('#image-input').on('change', function () {
        if (this.files && this.files[0]) {
            handleFile(this.files[0]);
        }
    });

    // Handle file
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        selectedFile = file;
        $('#detect-btn').prop('disabled', false);
        $('#drop-area p').text(`Selected file: ${file.name}`);

        // Show preview
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#preview').attr('src', e.target.result).show();
        };
        reader.readAsDataURL(file);
    }

    // Detect button
    $('#detect-btn').on('click', function () {
        if (!selectedFile) {
            alert('Please select an image first!');
            return;
        }

        $(this).prop('disabled', true).text('Detecting...');

        const formData = new FormData();
        formData.append('image', selectedFile);

        $.ajax({
            method: 'POST',
            url: 'https://api.api-ninjas.com/v1/objectdetection',
            data: formData,
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            headers: { 'X-Api-Key': 'ml5TXqTANmG3TRkhBO/eCw==aTtZQTmmxPPplcX7' },
            success: function (result) {
                $('#result').html(formatResult(result));
                $('#detect-btn').prop('disabled', false).text('Detect Objects');
            },
            error: function (jqXHR) {
                alert('Error: ' + jqXHR.responseText);
                $('#detect-btn').prop('disabled', false).text('Detect Objects');
            }
        });
    });

    // Format API result
    function formatResult(data) {
        if (!Array.isArray(data) || data.length === 0) return 'No objects detected.';
        return data
            .map(obj => `${obj.label || obj.name || 'Object'} (Confidence: ${(obj.confidence * 100).toFixed(2)}%)`)
            .join('<br>');
    }
});
