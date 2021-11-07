const API_URL = 'https://1111111111.execute-api.eu-west-1.amazonaws.com/';

let eventAdded = false;

let content = document.querySelector('main');

let selectFileBtn = document.getElementById('select-file-btn');

let resetBtn = document.getElementById('reset-btn');

let responseBg = document.createElement('div');
responseBg.classList.add('response-bg');

let responseWindow = document.createElement('div');
responseWindow.classList.add('response-window');

let responseWindowTextBox = document.createElement('div');

responseWindow.appendChild(responseWindowTextBox);

responseBg.appendChild(responseWindow);
content.appendChild(responseBg);

//RESPONSE-WINDOWS 
let RWLoad = (obj) => {
    responseWindowTextBox.innerHTML = '';

    let header = document.createElement('div');
    header.classList.add('rw-header', 'one');

    let headerText = document.createElement('div');
    headerText.classList.add('rw-header-text');

    let headerTextMain = document.createElement('p');
    headerTextMain.classList.add('rw-header-text-main');
    headerTextMain.innerText = obj.headerMain;

    let headerTextSub = document.createElement('p');
    headerTextSub.classList.add('rw-header-text-sub');
    headerTextSub.innerText = obj.headerSub;

    let loadBar = document.createElement('div');
    loadBar.classList.add('rw-loadbar');

    headerText.appendChild(headerTextMain);
    headerText.appendChild(headerTextSub);
    header.appendChild(headerText);

    let main = document.createElement('div');
    main.classList.add('rw-main');

    responseWindowTextBox.appendChild(header);
    responseWindowTextBox.appendChild(main);

    responseWindowTextBox.appendChild(loadBar);

    responseBg.style.display = 'grid';
}

let RWComplete = (obj) => {
    responseWindowTextBox.innerHTML = '';

    let header = document.createElement('div');
    header.classList.add('rw-header', 'two');

    let headerText = document.createElement('div');
    headerText.classList.add('rw-header-text');

    let headerTextMain = document.createElement('p');
    headerTextMain.classList.add('rw-header-text-main');
    headerTextMain.innerText = obj.headerMain;

    let headerTextSub = document.createElement('p');
    headerTextSub.classList.add('rw-header-text-sub');
    headerTextSub.innerText = obj.headerSub;

    let headerCloseBtnDiv = document.createElement('div');
    headerCloseBtnDiv.classList.add('rw-header-close');

    headerCloseBtnDiv.innerHTML = '&times;';
    headerCloseBtnDiv.addEventListener('click', () => {
        responseWindowTextBox.innerHTML = '';
        responseBg.style.display = 'none';
    });

    headerText.appendChild(headerTextMain);
    headerText.appendChild(headerTextSub);
    header.appendChild(headerText);
    header.appendChild(headerCloseBtnDiv);

    let main = document.createElement('div');
    main.classList.add('rw-main');

    for (let item of obj.mainContent) {
        if (item.list) {
            let mainList = document.createElement('div');
            mainList.classList.add('rw-main-list');
        
            let mainListUl = document.createElement('ul');
        
            for (let prop in item.list) {
                let mainListLi = document.createElement('li');
                mainListLi.innerHTML = prop + ': ' +
                '<b>' + item.list[prop] + '</b>';
                mainListUl.appendChild(mainListLi);
            }
        
            mainList.appendChild(mainListUl);
            main.appendChild(mainList);
        } else if (item.link) {
            let mainText = document.createElement('div');
            mainText.classList.add('rw-main-text');
    
            let mainTextA = document.createElement('a');
            mainTextA.setAttribute('href', item.link.url);
            mainTextA.innerText = item.link.text;
    
            mainText.appendChild(mainTextA);
            main.appendChild(mainText);
        } else if (item.textHtml) {
            let mainText = document.createElement('div');
            mainText.classList.add('rw-main-text');
    
            let mainTextP = document.createElement('p');
            mainTextP.innerHTML = item.textHtml.content;
    
            mainText.appendChild(mainTextP);
            main.appendChild(mainText);
        } else if (item.html) {
            let mainHtml = document.createElement('div');
            mainHtml.classList.add('rw-main-html');
            mainHtml.innerHTML = item.html.content;

            main.appendChild(mainHtml);
        }
    }

    if (obj.buttonContent) {
        let mainBtns = document.createElement('div');
        mainBtns.classList.add('rw-main-btns');
    
        let mainBtnsPKBtn = document.createElement('a');
        mainBtnsPKBtn.setAttribute('href', obj.buttonContent.url);
        mainBtnsPKBtn.innerText = obj.buttonContent.text;
    
        mainBtns.appendChild(mainBtnsPKBtn);
    
        main.appendChild(mainBtns);
    }

    responseWindowTextBox.appendChild(header);

    responseWindowTextBox.appendChild(main);

    responseBg.style.display = 'grid';
}


let filenameBox = document.querySelector('.filename');
let applyChangesBtn = document.getElementById('apply-btn');
let stepAction = document.querySelectorAll('.step-action');
let inputs = document.querySelectorAll('.step-action input');
let resultImageBox = document.querySelector('.result-image');
let quality = document.getElementById('quality');
let qualityName = document.getElementById('quality-name');
let qualityInput = document.getElementById('quality-input');
let qualityContent = quality.querySelector('.step-action-content');
let resize = document.getElementById('resize');
let resizeName = document.getElementById('resize-name');
let resizeContent = resize.querySelector('.step-action-content');
let widthInput = document.getElementById('width-input');
let heightInput = document.getElementById('height-input');
let ratio = 0;
let thumbnail = document.getElementById('thumbnail');
let thumbnailName = document.getElementById('thumbnail-name');
let thumbnailInput = document.getElementById('thumbnail-input');
let thumbnailContent = thumbnail.querySelector('.step-action-content');
let labels = document.getElementById('labels');
let labelsName = document.getElementById('labels-name');
let extractText = document.getElementById('extract-text');
let extractTextName = document.getElementById('extract-text-name');
let removeBackground = document.getElementById('remove-background');
let removeBackgroundName = document.getElementById('remove-background-name');

let selectImages = (params) => {
    filenameBox.innerHTML = '';
    if(params.files.length == 1) {
        let filenameP = document.createElement('p');
        filenameP.innerText = params.files[0].name + ' selected';
        filenameBox.appendChild(filenameP);
        applyChangesBtn.removeAttribute('disabled');
        applyChangesBtn.classList.remove('disabled');
        applyChangesBtn.classList.add('enabled');
        let image = new Image();
        image.onload = () => {
            let width = image.width;
            let height = image.height;
            document.getElementById('width-input').value = width;
            document.getElementById('height-input').value = height;
            ratio = (width / height).toFixed(3);
            
        };
        let objectUrl = URL.createObjectURL(params.files[0]);
        image.src = objectUrl;
    } else if (params.files.length > 1) {
        let n = 1;
        for (let file of params.files) {
            if(n == 5) {
                let rest = params.files.length - (n - 1);
                let filenameP = document.createElement('p');
                filenameP.innerText = 'and ' + rest + ' more...';
                filenameBox.appendChild(filenameP);
                break;
            }
            let filenameP = document.createElement('p');
            filenameP.innerText = file.name + ' selected';
            filenameBox.appendChild(filenameP);
            n++;
        }
        applyChangesBtn.removeAttribute('disabled');
        applyChangesBtn.classList.remove('disabled');
        applyChangesBtn.classList.add('enabled');
    }
}

let uploadFiles = async (params) => {
    let paths = [];
    for (let file of params.inputData.files) {
        await fetch(API_URL + 'uploadfile', {
            method: 'POST',
            body: JSON.stringify({
                filename: file.name,
                filetype: file.type,
                filesize: file.size
            })
        }).then(async (res) => {
            if (res.ok) {
                await res.json().then(async (data) => {
                    
                    let form = new FormData();
                    Object.keys(data.fields).forEach(key => {
                        form.append(key, data.fields[key]);
                    });
                    form.append('file', file);
                    await fetch(data.url, {
                        method: 'POST',
                        body: form
                    }).then((resUpload) => {
                        if(resUpload.ok) {
                            paths.push(data.fields.key);
                            let filenameP = document.createElement('p');
                            filenameP.innerText = file.name + ' selected';
                            filenameBox.appendChild(filenameP);
                            let image = new Image();
                            image.onload = () => {
                                let width = image.width;
                                let height = image.height;
                                document.getElementById('width-input').value = width;
                                document.getElementById('height-input').value = height;
                                ratio = (width / height).toFixed(3);
                                
                            };
                            let objectUrl = URL.createObjectURL(params.inputData.files[0]);
                            image.src = objectUrl;   
                        }
                    })
                })
            } else {
                res.json().then((err) => {
                    RWComplete({
                        headerMain: 'ERROR',
                        headerSub: 'There is an error with the request',
                        mainContent: [
                            {
                                list: err
                            }
                        ]
                    });
                    selectFileBtn.innerText = 'Select Images';
                })
            }
        });
    }  

    return paths;
}

let changeBtns = () => {
    selectFileBtn.innerText = 'Images uploaded';
    selectFileBtn.classList.remove('enabled');
    selectFileBtn.classList.add('disabled');
    selectFileBtn.setAttribute('disabled', true);
    resetBtn.classList.remove('disabled');
    resetBtn.classList.add('enabled');
    resetBtn.removeAttribute('disabled');

    applyChangesBtn.removeAttribute('disabled');
    applyChangesBtn.classList.remove('disabled');
    applyChangesBtn.classList.add('enabled');
}


let images;
let pathArray;

let selectInput = document.createElement('input');
selectInput.setAttribute('type', 'file');
selectInput.setAttribute('accept', 'image/*');
selectInput.setAttribute('multiple', 'true');
selectFileBtn.addEventListener('click', () => {
    selectInput.click();
    if (!eventAdded) {
        eventAdded = true;
        selectInput.addEventListener('change', async () => {
            selectFileBtn.innerText = 'Uploading...';
            pathArray = await uploadFiles({
                inputData: selectInput
            });

            if (pathArray.length > 0) {
                changeBtns();   
            }

            console.log(pathArray);
        });
    }
});

let dropFileBox = document.getElementById('dropFileHere');
dropFileBox.addEventListener('drop', async (e) => {
    e.preventDefault();
    console.log('File dropped');
    selectFileBtn.innerText = 'Uploading...';
    pathArray = await uploadFiles({
        inputData: e.dataTransfer
    });
    if (pathArray.length > 0) {
        changeBtns();   
    }

    console.log(pathArray)
});

dropFileBox.addEventListener('dragover', (e) => {
    e.preventDefault();
});

resetBtn.addEventListener('click', () => {
    selectFileBtn.innerText = 'Select images';
    selectFileBtn.classList.remove('disabled');
    selectFileBtn.classList.add('enabled');
    selectFileBtn.removeAttribute('disabled');
    resetBtn.classList.remove('enabled');
    resetBtn.classList.add('disabled');
    resetBtn.setAttribute('disabled', true);
    applyChangesBtn.setAttribute('disabled', true);

    applyChangesBtn.setAttribute('disabled', true);
    applyChangesBtn.classList.remove('enabled');
    applyChangesBtn.classList.add('disabled');

    document.querySelector('.filename').innerHTML = '';

    pathArray = [];
})

qualityName.addEventListener('click', () => {

    if(quality.classList.contains('action-disabled')) {
        quality.classList.remove('action-disabled');
        quality.classList.add('action-enabled');
        qualityInput.removeAttribute('disabled');
        qualityContent.classList.remove('action-content-disabled');
        qualityContent.classList.add('action-content-enabled');

        labels.classList.remove('action-enabled');
        labels.classList.add('action-disabled');

        extractText.classList.remove('action-enabled');
        extractText.classList.add('action-disabled');

        removeBackground.classList.remove('action-enabled');
        removeBackground.classList.add('action-disabled');
    } else {
        quality.classList.remove('action-enabled');
        quality.classList.add('action-disabled');
        qualityInput.setAttribute('disabled', 'true');
        qualityContent.classList.remove('action-content-enabled')
        qualityContent.classList.add('action-content-disabled');
    }  
})

resizeName.addEventListener('click', () => {

    if(resize.classList.contains('action-disabled')) {
        resize.classList.remove('action-disabled');
        resize.classList.add('action-enabled');
        resizeContent.classList.remove('action-content-disabled');
        resizeContent.classList.add('action-content-enabled');

        labels.classList.remove('action-enabled');
        labels.classList.add('action-disabled');

        extractText.classList.remove('action-enabled');
        extractText.classList.add('action-disabled');

        removeBackground.classList.remove('action-enabled');
        removeBackground.classList.add('action-disabled');
    } else {
        resize.classList.remove('action-enabled');
        resize.classList.add('action-disabled');
        resizeContent.classList.remove('action-content-enabled')
        resizeContent.classList.add('action-content-disabled');
        
    }
})



let widthRadio = document.getElementById('width-radio');
let heightRadio = document.getElementById('height-radio');
widthRadio.checked = false;
heightRadio.checked = false;
widthRadio.addEventListener('change', () => {
    
    if(widthRadio.checked === true) {
        widthInput.removeAttribute('disabled');
        heightInput.setAttribute('disabled', 'true');
    }
})


heightRadio.addEventListener('change', () => {
    if(heightRadio.checked === true) {
        heightInput.removeAttribute('disabled');
        widthInput.setAttribute('disabled', 'true');
    }
})

widthInput.addEventListener('change', () => {
    if (ratio != 0) {
        let widthValue = widthInput.value;
        let newHeight = Math.round(widthValue / ratio);
        heightInput.value = newHeight;
    }
    
});

heightInput.addEventListener('change', () => {
    if (ratio != 0) {
        let heightValue = heightInput.value;
        let newWidth = Math.round(heightValue * ratio);
        widthInput.value = newWidth;
    }
    
});

thumbnailName.addEventListener('click', () => {
    
    if(thumbnail.classList.contains('action-disabled')) {
        thumbnail.classList.remove('action-disabled');
        thumbnail.classList.add('action-enabled');
        thumbnailInput.removeAttribute('disabled');
        thumbnailContent.classList.remove('action-content-disabled');
        thumbnailContent.classList.add('action-content-enabled');

        labels.classList.remove('action-enabled');
        labels.classList.add('action-disabled');

        extractText.classList.remove('action-enabled');
        extractText.classList.add('action-disabled');

        removeBackground.classList.remove('action-enabled');
        removeBackground.classList.add('action-disabled');
    } else {
        thumbnail.classList.remove('action-enabled');
        thumbnail.classList.add('action-disabled');
        thumbnailInput.setAttribute('disabled', 'true');
        thumbnailContent.classList.remove('action-content-enabled')
        thumbnailContent.classList.add('action-content-disabled');
    }
})

labelsName.addEventListener('click', () => {
    if(labels.classList.contains('action-disabled')) {
        labels.classList.remove('action-disabled');
        labels.classList.add('action-enabled');

        thumbnail.classList.remove('action-enabled');
        thumbnail.classList.add('action-disabled');
        thumbnailInput.setAttribute('disabled', 'true');
        thumbnailContent.classList.remove('action-content-enabled')
        thumbnailContent.classList.add('action-content-disabled');

        resize.classList.remove('action-enabled');
        resize.classList.add('action-disabled');
        resizeContent.classList.remove('action-content-enabled')
        resizeContent.classList.add('action-content-disabled');

        quality.classList.remove('action-enabled');
        quality.classList.add('action-disabled');
        qualityInput.setAttribute('disabled', 'true');
        qualityContent.classList.remove('action-content-enabled')
        qualityContent.classList.add('action-content-disabled');

        extractText.classList.remove('action-enabled');
        extractText.classList.add('action-disabled');

        removeBackground.classList.remove('action-enabled');
        removeBackground.classList.add('action-disabled');
    } else {
        labels.classList.remove('action-enabled');
        labels.classList.add('action-disabled');
        
    }
})

extractTextName.addEventListener('click', () => {
    if(extractText.classList.contains('action-disabled')) {
        extractText.classList.remove('action-disabled');
        extractText.classList.add('action-enabled');

        thumbnail.classList.remove('action-enabled');
        thumbnail.classList.add('action-disabled');
        thumbnailInput.setAttribute('disabled', 'true');
        thumbnailContent.classList.remove('action-content-enabled')
        thumbnailContent.classList.add('action-content-disabled');

        resize.classList.remove('action-enabled');
        resize.classList.add('action-disabled');
        resizeContent.classList.remove('action-content-enabled')
        resizeContent.classList.add('action-content-disabled');

        quality.classList.remove('action-enabled');
        quality.classList.add('action-disabled');
        qualityInput.setAttribute('disabled', 'true');
        qualityContent.classList.remove('action-content-enabled')
        qualityContent.classList.add('action-content-disabled');

        labels.classList.remove('action-enabled');
        labels.classList.add('action-disabled');

        removeBackground.classList.remove('action-enabled');
        removeBackground.classList.add('action-disabled');
    } else {
        extractText.classList.remove('action-enabled');
        extractText.classList.add('action-disabled');
        
    }
})

removeBackgroundName.addEventListener('click', () => {
    if(removeBackground.classList.contains('action-disabled')) {
        removeBackground.classList.remove('action-disabled');
        removeBackground.classList.add('action-enabled');

        thumbnail.classList.remove('action-enabled');
        thumbnail.classList.add('action-disabled');
        thumbnailInput.setAttribute('disabled', 'true');
        thumbnailContent.classList.remove('action-content-enabled')
        thumbnailContent.classList.add('action-content-disabled');

        resize.classList.remove('action-enabled');
        resize.classList.add('action-disabled');
        resizeContent.classList.remove('action-content-enabled')
        resizeContent.classList.add('action-content-disabled');

        quality.classList.remove('action-enabled');
        quality.classList.add('action-disabled');
        qualityInput.setAttribute('disabled', 'true');
        qualityContent.classList.remove('action-content-enabled')
        qualityContent.classList.add('action-content-disabled');

        labels.classList.remove('action-enabled');
        labels.classList.add('action-disabled');

        extractText.classList.remove('action-enabled');
        extractText.classList.add('action-disabled');
    } else {
        removeBackground.classList.remove('action-enabled');
        removeBackground.classList.add('action-disabled');
        
    }
})

let applyChanges = async (pathArray) => {
    let transformations = [];
    if(quality.classList.contains('action-enabled')) {
        let qualityValue = document.getElementById('quality-input').value;
        transformations.push({
            name: 'quality',
            value: parseInt(qualityValue, 10)
        });
    }
    if(resize.classList.contains('action-enabled')) {
        let widthValue = document.getElementById('width-input').value;
        let heightValue = document.getElementById('height-input').value;
        let values = {};
        if(widthValue == '' && heightValue == '') {
            alert('Some value is required if you select Resize');
            return;
        }
        if (widthRadio.checked === true) {
            values.width = parseInt(widthValue, 10);
        }
        if(heightRadio.checked === true) {
            values.height = parseInt(heightValue, 10);
        }
        transformations.push({
            name: 'resize',
            value: values
        });
    }

    if(thumbnail.classList.contains('action-enabled')) {
        let thumbnailValue = document.getElementById('thumbnail-input').value;
        if (thumbnailValue == '') {
            alert('Some value is required if you select Thumbnail');
            return;
        }
        transformations.push({
            name: 'thumbnail',
            value: parseInt(thumbnailValue, 10)
        });
    }

    if(labels.classList.contains('action-enabled')) {
        transformations.push({
            name: 'labels',
        });
    }

    if(extractText.classList.contains('action-enabled')) {
        transformations.push({
            name: 'extract-text',
        });
    }

    if(removeBackground.classList.contains('action-enabled')) {
        transformations.push({
            name: 'remove-background',
        });
    }

    let resultImageBox = document.querySelector('.rw-main');
    for (let path of pathArray) {
        await fetch(API_URL + 'editimage', {
            method: 'POST',
            body: JSON.stringify({
                key: path,
                transformations: transformations
            })
        }).then(async (res) => {
            if (res.ok) {
                await res.json().then(async (data) => {
                    if (labels.classList.contains('action-enabled')) {
                        let labelsResponseDiv = document.createElement('div');
                        for (let label of data.Labels) {
                            let paragraph = document.createElement('p');
                            paragraph.innerText = label.Name + ' - Confidence: ' + label.Confidence.toFixed(2) + '%';
                            labelsResponseDiv.appendChild(paragraph);
                        }
                        resultImageBox.appendChild(labelsResponseDiv);
                    } else if (extractText.classList.contains('action-enabled')) {
                        let extractTextResponseDiv = document.createElement('div');
                        //console.log(data);
                        //let paragraph = document.createElement('p');
                        //paragraph.innerText = data.message;
                        //extractTextResponseDiv.appendChild(paragraph);
                        for (let text of data.Blocks) {
                            if (text.BlockType == 'LINE') {
                                let paragraph = document.createElement('p');
                                paragraph.innerText = text.Text;
                                extractTextResponseDiv.appendChild(paragraph);
                            }
                            
                        }
                        resultImageBox.appendChild(extractTextResponseDiv);
                    } else {
                        let anchorImage = document.createElement('a');
                        anchorImage.href = 'https://imgproc.rs1.es/' + data.newkey;
                        anchorImage.setAttribute('target', '_blank');
                        let resultImage = document.createElement('img');
                        resultImage.src = 'https://imgproc.rs1.es/' + data.newkey;
                        anchorImage.appendChild(resultImage);
                        resultImageBox.appendChild(anchorImage);
                    }
                    
                })
            } else {
                res.json().then((error) => {
                    let p = document.createElement('p');
                    p.innerText = error.message;
                    resultImageBox.appendChild(p); 
                })
            }
        });
    }
    let rwHeaderMain = document.querySelector('.rw-header-text-main');
    rwHeaderMain.innerText = 'Result:';
    let rwHeaderSub = document.querySelector('.rw-header-text-sub');
    rwHeaderSub.innerText = '(right click or long touch on the image and download it)'

    document.querySelector('.rw-loadbar').remove();
    let headerCloseBtnDiv = document.createElement('div');
    headerCloseBtnDiv.classList.add('rw-header-close');

    headerCloseBtnDiv.innerHTML = '&times;';
    headerCloseBtnDiv.addEventListener('click', () => {
        responseWindowTextBox.innerHTML = '';
        responseBg.style.display = 'none';
    });

    let header = document.querySelector('.rw-header');
    header.classList.add('two');
    header.classList.remove('one');
    header.appendChild(headerCloseBtnDiv);
    
}

applyChangesBtn.addEventListener('click', () => {
    RWLoad({
        headerMain: 'Loading, please wait...',
        headerSub: ''
    });
    applyChanges(pathArray);
});
