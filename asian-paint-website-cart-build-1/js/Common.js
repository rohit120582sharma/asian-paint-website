//$(document).ready(function () {

var $ = jQuery.noConflict();
var URL = '';
var DATA = '';
var getData = '';
var Name = '';
var Type = '';
var ParentControl = '';

function SendData(URL, DATA) {

    var capture = '';
    $.ajax({
        type: "POST",
        url: URL,
        data: DATA,
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            capture = response;
        },
        failure: function (response) {
            alert(response);
        }
    });
    return capture;
}


function GetDataSync(URL, DATA) {
    var capture = '';
    $.ajax({
        type: "POST",
        url: URL,
        data: DATA,
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            capture = response;
        },
        failure: function (response) {
            alert(response);
        }
    });
    return capture;
}

function GetDataAsync(URL, DATA, FUNOBJ) {
    $.ajax({
        type: "POST",
        url: URL,
        data: DATA,
        async: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: FUNOBJ,
        failure: function (response) {
            alert(response);
        }
    });
}

function GetData(response) {
    var Status = JSON.parse(response.d);
    getData = Status;
    return Status;
}

var overlay = $('<div id="overlay"></div>');
function ShowPopup(Name) {
    overlay.appendTo(document.body);
    $(Name).show();
}
function HidePopup(Name) {
    $(Name).hide();
    ClearTextbox(Name);
    overlay.appendTo(document.body).remove();

}

////////Query String////////////////////////
function getQueryStringByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

////////Cookies String////////////////////////
function getCookieByName(name,cookieName) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp(name + "=([^&#]*)"),
        results = regex.exec($.readCookie(cookieName));
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
////////Fileupload//////////////////////////////////////////////////////////////////////
var FileID = "";
var SessionID = "";
var labelID = "";

function uploadFile(FileID, SessionID, labelID) {
    var ReturnData = "";
    var fileUploader = $('#' + FileID).get(0);
    var files = fileUploader.files;
    var fileCount = files.length;
    var data = new FormData();
    for (var i = 0; i < fileCount; i++) {
        data.append(files[i].name, files[i]);
    }
    var options = {};
    options.url = '../FileUploader.ashx?SessionID=' + SessionID;
    options.type = 'post';
    options.data = data;
    options.async = false;
    options.contentType = false;
    options.processData = false;
    options.beforeSend = function () {
        $('#' + labelID).show();
        $('#' + labelID).attr('class', 'label label-warning tag');
        $('#' + labelID).html("Uploading........ ");
    };
    options.success = function () {
        $('#' + labelID).show();
        $('#' + labelID).attr('class', 'label label-success tag');
        $('#' + labelID).html("Upload Success ");
    };
    options.error = function () {
        alert('Problem uploading file');
        $('#' + labelID).show(); $('#' + labelID).attr('class', 'label label-danger tag');
        $('#' + labelID).html("Problem uploading file");
    };
    options.complete = function (response) {
        $('#' + labelID).show(); $('#' + labelID).attr('class', 'label label-success tag');
        $('#' + labelID).html("Upload Complete ");
        ReturnData = response.responseText;
    };
    $.ajax(options);
    return ReturnData;
}


function uploadFileByObject(FileObject, SessionID, labelID) {
    var ReturnData = "";
    //var fileUploader = $('#' + FileID).get(0);
    //var files = fileUploader.files;
    //var fileCount = files.length;
    var data = new FormData();
    // for (var i = 0; i < FileObject.length; i++) {
    data.append(FileObject.name, FileObject);
    //}
    var options = {};
    options.url = '../FileUploader.ashx?SessionID=' + SessionID;
    options.type = 'post';
    options.data = data;
    options.async = false;
    options.contentType = false;
    options.processData = false;
    options.beforeSend = function () {
        $('#' + labelID).show();
        $('#' + labelID).attr('class', 'label label-warning tag');
        $('#' + labelID).html("Uploading........ ");
    };
    options.success = function () {
        $('#' + labelID).show();
        $('#' + labelID).attr('class', 'label label-success tag');
        $('#' + labelID).html("Upload Success ");
    };
    options.error = function () {
        alert('Problem uploading file');
        $('#' + labelID).show(); $('#' + labelID).attr('class', 'label label-danger tag');
        $('#' + labelID).html("Problem uploading file");
    };
    options.complete = function (response) {
        $('#' + labelID).show(); $('#' + labelID).attr('class', 'label label-success tag');
        $('#' + labelID).html("Upload Complete ");
        ReturnData = response.responseText;
    };
    $.ajax(options);
    return ReturnData;
}
/////////////////////////////////////////////////////////////////////////////////////////////


function ClearTextbox(ParentControl) {
    var control = $(ParentControl).get(0);
    var list = control.getElementsByTagName("input");
    var textAreaList = control.getElementsByTagName("textarea");
    var selectList = control.getElementsByTagName("select");
    for (var i = 0; i < list.length; i++) {
        var attr = list[i].getAttribute('type');
        var control = document.getElementById(list[i].id);
        switch (attr) {
            case "text":
                $(control).val('');
                break;

            case "hidden":
                $(control).val('');
                break;

            case "checkbox":
                control.checked = false;
                break;

            case "radio":
                control.checked = false;
                break;

            case "range":
                control.setAttribute('value', '0');
                break;

            case "file":
                control.setAttribute('value', '');
                break;
        }
    }

    for (var i = 0; i < textAreaList.length; i++) {
        var control = document.getElementById(textAreaList[i].id);
        $(control).val('');
    }
    for (var i = 0; i < selectList.length; i++) {
        $(selectList[i]).val('');
    }
}


//});