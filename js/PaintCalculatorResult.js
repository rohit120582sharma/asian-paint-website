
//////////////////Start Common Funtions///////////////////////////////////////

function fnTrim(strParam) {
    strParam = fnLeftTrim(strParam);
    strParam = fnRightTrim(strParam);
    return strParam;
}

function fnLeftTrim(strParam) {
    while (strParam.substring(0, 1) == ' ') {
        strParam = strParam.substring(1, strParam.length);
    }
    return strParam;
}

function fnRightTrim(strParam) {
    while (strParam.substring(strParam.length - 1, strParam.length) == ' ') {
        strParam = strParam.substring(0, strParam.length - 1);
    }
    return strParam;
}

function fnClearSelectBox(strSelect) {
    var objSelect = document.getElementById(strSelect);
    objSelect.selectedIndex = 0;
    var intLength = objSelect.length
    for (i = 0; i < intLength - 1; i++)
        objSelect.remove(1);
}

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

//////////////////End Common Funtions///////////////////////////////////////
var resultData = "";
var resultData1 = "";
var Location = "";
var System = "";
var Height = "";
var Width = "";
var Length = "";
var Door = "";
var Window = "";
var RoomLeft = "";
var Roombottom = "";
var RoomRight = "";
var Roomtop = "";
var Dimensions = "";
var RoomRoof = "";
var PlainFinishProduct = "";
var TexturedFinishProduct = "";
var DoorsPaintProduct = "";
var WindowsPaintProduct = "";
var LLMTopCoat, LLMPrimerCost, LLMPuttyCost, ULMTopCoat, ULMPrimerCost, ULMPuttyCost;
var PlainFinishProductImg, TexturedFinishProductImg;
var PlainFinishProductDescription, TexturedFinishProductDescription;

var PlainTotalTopCoat;
var PlainTotalPrimerCost;
var PlainTotalPuttyCost;
var PlainTotalMaterialCost;

var TexturedTotalTopCoat;
var TexturedTotalPrimerCost;
var TexturedTotalPuttyCost;
var TexturedTotalMaterialCost;
var RoomEstimateTotal;
var PlainULTotalMaterialCost, PlainLLTotalMaterialCost, TexturedLLTotalMaterialCost, TexturedULTotalMaterialCost;

var PaintCoverage, PaintNoCoats, PrimerName, PrimerName1, PrimerCoverage, PrimerNoCoats, PuttyName, PuttyName1, PuttyCoverage, PuttyNoCoats;
var PlainProductQtyRequired, PlainPrimerQtyRequired, PlainPuttyQtyRequired, TexturedProductQtyRequired, TexturedPrimerQtyRequired, TexturedPuttyQtyRequired;
var DoorsPaintProduct, DoorsPaintProductImg, DoorsPaintProductDescription, DoorsPaintQtyRequired, DoorsPaintTotalTopCoat;
var WindowsPaintProduct, WindowsPaintProductImg, WindowsPaintProductDescription, WindowsPaintQtyRequired, WindowsPaintTotalTopCoat;
var TotalEstimate = 0;
var RoomLLEstimatesubTotal = 0;
var RoomULEstimatesubTotal = 0;

var Flag = false;
var selectedPlainInRoomArr = [];
var selectedTextureInRoomArr = [];
var selectedDoorsPaintInRoomArr = [];
var selectedWindowsPaintInRoomArr = [];

function getAdvanceCalculatorData() {
    var data = JSON.parse($.readCookie('AdvanceCalculatorData'));
    if (data != null || data != undefined) {
        resultData = ""
        for (var i = 0; i < data.length; i++) {
            var item = data[i];

            projectName = item.projectName;
            //console.log(item.projectName);

            Location = item.Location;
            //console.log(item.Location);
            System = item.System;
            //console.log(item.System);
            Height = Number(item.height);
            //console.log(item.height);
            Width = Number(item.width);
            //console.log(item.width);
            Length = Number(item.breath);
            //console.log(item.breath);
            Door = item.Door;
            console.log(item.Door);
            Window = item.window;
            //console.log(item.window);
            RoomLeft = item.RoomLeft;
            //console.log(item.RoomLeft);
            Roombottom = item.Roombottom;
            //console.log(item.Roombottom);
            RoomRight = item.RoomRight;
            //console.log(item.RoomRight);
            Roomtop = item.Roomtop;
            //console.log(item.Roomtop);
            RoomRoof = item.RoomRoof;
            //console.log(item.RoomRoof);
            Dimensions = item.Dimensions;
            //console.log(item.Dimensions);
            PlainFinishProduct = item.PlainFinishProduct;
            //console.log(item.PlainFinishProduct);
            TexturedFinishProduct = item.TexturedFinishProduct;
            //console.log(item.TexturedFinishProduct);
            DoorsPaintProduct = item.DoorsPaintProduct;
            //console.log(item.DoorsPaintProduct);
            WindowsPaintProduct = item.WindowsPaintProduct;
            //console.log(item.WindowsPaintProduct);
            getPaintCalculatorData(item, i);

        }
    }
}

function getData() {
    resultData += '<div class="col-md-12 no-mobile-padding">';
    resultData += '                    <div class="cost totalCost subTotal mb-55">';
    resultData += '                        <span class="roomEstimat col-md-3 col-xs-6 no-mobile-padding">total estimate</span><span';
    resultData += '                            class="col-md-6 no-mobile-padding"><span class="icon-inr"></span> ' + TotalEstimate + '</span>';
    resultData += '                    </div>';
    resultData += '                    <div class="addRoom">';
    resultData += '                        <div class="col-md-6 col-xs-12 saveprintshare mb-25">';
    resultData += '                            <ul>';
    resultData += '                                <li><a href="javascript:void(0);">';
    resultData += '                                    <img src="images/save.jpg"><span>save</span> </a></li>';
    resultData += '                                <li><a href="javascript:void(0);">';
    resultData += '                                    <img src="images/print-yellow.jpg"><span>print</span> </a></li>';

    resultData += '                                <li><a href="#" class="email-share-button">';
    resultData += '                                    <img src="images/mail.svg" alt="Image" width="27" height="23"><span>mail</span></a>';
    resultData += '                                    <div class="email-share-input">';
    resultData += '                                       <input type="text" placeholder="enter your email id">';
    resultData += '                                       <button type="submit">submit</button>';
    resultData += '                                    </div>';
    resultData += '                                </li>';

    resultData += '                                <li><a href="#" class="social-share-button">';
    resultData += '                                    <img src="images/sahre.jpg"><span>share</span> </a>';
    resultData += '                                    <div class="soc-ico">';
    resultData += '                                       <a href="#" class="facebook" target="_blank" title="Facebook"><img src="images/fb.svg" alt="Image" width="25"></a>';
    resultData += '                                       <a href="#" class="twitter" target="_blank" title="Twitter"><img src="images/twitter.svg" alt="Image" width="25"></a>';
    resultData += '                                    </div>';
    resultData += '                                </li>';
    resultData += '                            </ul>';
    resultData += '                        </div>';
    resultData += '                        <div class="col-md-4  col-xs-12 addBtn">';
    resultData += '                            <a href="ap-paint-budget-calculator.html" class="btn-style2">edit</a>';
    resultData += '                        </div>';
    resultData += '                    </div>';
    resultData += '                </div>';
    document.getElementById("resultData").innerHTML = resultData;
}



function getPaintCalculatorData(item, index) {
    var RoomId = index + 1;
    var TexturedProduct = item.TexturedFinishProduct;
    var PlainProduct = item.PlainFinishProduct;
    CalulatePlainFinishProduct(item, RoomId);
    CalulateTexturedFinishProduct(item, RoomId);    
    CalulateDoorsPaintProduct(item, RoomId);
    CalulateWindowsPaintProduct(item, RoomId);

    resultData += '<div class="room mb-55 brdr-secn">';
    resultData += '                        <h2 class="big-h2">';
    resultData += '                            <span>room ' + RoomId + '</span></h2>';

    if (PlainProduct == "select") {
    } else {

        // Plain Finish
        resultData += '                        <div class="brdr-secn clearfix">';
        resultData += '                            <h2 class="mb-25">';
        resultData += '                                 plain finish </h2>';
        resultData += '                            <div class="paintContainer clearfix mb-25">';
        //resultData += '                                <a class="close" href="javascript:void(0);">x</a>';
        resultData += '                                <div class="paintRequired col-md-8 col-sm-7 col-xs-12">';
        resultData += '                                    <div class="top-row row">';
        resultData += '                                        <div class="col-md-6 col-sm-6 col-xs-7">';
        resultData += '                                            <div class="faq-select-drop-down-item">';
        resultData += '                                                <div class="slct-style1 selectStrong mb-10">';
        resultData += '                                                    <select id ="ddlPlainFinishProduct' + RoomId + '" class="selectpicker" onchange="ChangePlainFinishProduct(' + RoomId + ');">';
        resultData += '                                                        <option>select</option>';
        resultData += '                                                    </select>';
        resultData += '                                                </div>';
        resultData += '                                            </div>';
        resultData += '                                        </div>';
        resultData += '                                        <div class="col-md-6 col-sm-6 col-xs-5">';
        resultData += '                                            <div class="desc__bold">';
        resultData += '                                                <p>';
        resultData += '                                                    <span class="icon-inr"></span>  ' + PlainTotalTopCoat + ' ';
        resultData += '                                                </p>';
        resultData += '                                            </div>';
        resultData += '                                        </div>';
        resultData += '                                        <div class="col-md-12 col-xs-12">';
        resultData += '                                            ' + PlainProductQtyRequired + ' liters';
        resultData += '                                        </div>';
        resultData += '                                    </div>';
        resultData += '                                    <div class="row">';
        resultData += '                                        <div class="bottomRow col-md-12">';
        resultData += '                                            <table class="table">';
        resultData += '                                                <tr>';
        resultData += '                                                    <th scope="col">';
        resultData += '                                                        <strong>ensure a perfect finish with these additional products</strong>';
        resultData += '                                                    </th>';
        resultData += '                                                </tr>';
        resultData += '                                                <tr>';
        resultData += '                                                    <td>';
        resultData += '                                                        <table width="100%" border="0">';
        resultData += '                                                            <tr class="lh-2">';
        resultData += '                                                                <th scope="col">';
        resultData += '                                                                    wall putty ';
        resultData += '                                                                </th>';
        resultData += '                                                                <th scope="col">';
        resultData += '                                                                    &nbsp;';
        resultData += '                                                                </th>';
        resultData += '                                                            </tr>';
        resultData += '                                                            <tr class="bdr-btm">';
        resultData += '                                                                <td height="51" align="left" valign="middle" class="small">';
        resultData += '                                                                    ' + PrimerName + '<br>';
        resultData += '                                                                    ' + PlainPrimerQtyRequired + ' kg';
        resultData += '                                                                </td>';
        resultData += '                                                                <td align="left" valign="middle">';
        resultData += '                                                                    <p class="pr-top15">';
        resultData += '                                                                        <span class="icon-inr"></span>' + PlainTotalPrimerCost + '';
        resultData += '                                                                    </p>';
        resultData += '                                                                </td>';
        resultData += '                                                            </tr>';
        resultData += '                                                            <tr>';
        resultData += '                                                                <td height="51" align="left" valign="middle" class="small">';
        resultData += '                                                                    ' + PuttyName + '<br>';
        resultData += '                                                                    ' + PlainPuttyQtyRequired + ' kg';
        resultData += '                                                               </td>';
        resultData += '                                                                <td align="left" valign="middle">';
        resultData += '                                                                    <p class="pr-top15">';
        resultData += '                                                                        <span class="icon-inr"></span>' + PlainTotalPuttyCost + '';
        resultData += '                                                                    </p>';
        resultData += '                                                                </td>';
        resultData += '                                                            </tr>';
        resultData += '                                                        </table>';
        resultData += '                                                    </td>';
        resultData += '                                                </tr>';
        resultData += '                                            </table>';
        resultData += '                                        </div>';
        resultData += '                                    </div>';
        resultData += '                                    <div class="cost">';
        resultData += '                                        <span class="icon-inr"></span>' + PlainTotalMaterialCost + '</div>';
        resultData += '                                </div>';
        resultData += '                                <div class="col-md-4 col-sm-5 hidden-xs paintImgWrapper">';
        resultData += '                                    <div class="paintImgDesc">';
        resultData += '                                        <div class="imgComt">';
        resultData += '                                            <p class="color-product-wrapper">';
        resultData += '                                                <img class="color-product-img" src="productImg/' + PlainFinishProductImg + '">';
        resultData += '                                                <span class="color-name">' + PlainFinishProduct + '</span>';
        resultData += '                                            </p>';
        resultData += '                                        </div>';
        resultData += '                                        <p>';
        resultData += '                                            ' + PlainFinishProductDescription + '';
        resultData += '                                        </p>';
        resultData += '                                    </div>';
        resultData += '                                </div>';
        resultData += '                            </div>';
        resultData += '                        </div>';
    }
    if (TexturedProduct == "select") 
    {
    }else{
        // Textured Finish
        resultData += '                        <div class="brdr-secn clearfix">';
        resultData += '                            <h2 class="mb-25">';
        resultData += '                                textured finish </h2>';
        resultData += '                            <div class="paintContainer clearfix mb-25">';
        //resultData += '                                <a class="close" href="javascript:void(0);">x</a>';
        resultData += '                                <div class="paintRequired col-md-8 col-sm-7 col-xs-12">';
        resultData += '                                    <div class="top-row row">';
        resultData += '                                        <div class="col-md-6 col-sm-6 col-xs-7">';
        resultData += '                                            <div class="faq-select-drop-down-item">';
        resultData += '                                                <div class="slct-style1 selectStrong mb-10">';
        resultData += '                                                    <select id="ddlTexturedFinishProduct' + RoomId + '" class="selectpicker" onchange="ChangeTexturedFinishProduct(' + RoomId + ');">';
        resultData += '                                                        <option selected>select</option>';
        resultData += '                                                    </select>';
        resultData += '                                                </div>';
        resultData += '                                            </div>';
        resultData += '                                        </div>';
        resultData += '                                        <div class="col-md-6 col-sm-6 col-xs-6">';
        resultData += '                                             <div class="desc__bold">';
        resultData += '                                                <p>';
        resultData += '                                                    <span class="icon-inr"></span> ' + TexturedTotalTopCoat + '';
        resultData += '                                                </p>';
        resultData += '                                            </div>';
        resultData += '                                        </div>';
        resultData += '                                        <div class="col-md-12 col-xs-12">';
        resultData += '                                            ' + TexturedProductQtyRequired + ' liters';
        resultData += '                                        </div>';
        resultData += '                                    </div>';
        resultData += '                                    <div class="row">';
        resultData += '                                        <div class="bottomRow col-md-12">';
        resultData += '                                            <table class="table">';
        resultData += '                                                <tr>';
        resultData += '                                                    <th scope="col">';
        resultData += '                                                        <strong>ensure a perfect finish with these additional products</strong>';
        resultData += '                                                    </th>';
        resultData += '                                                </tr>';
        resultData += '                                                <tr>';
        resultData += '                                                    <td>';
        resultData += '                                                        <table width="100%" border="0">';
        resultData += '                                                            <tr class="lh-2">';
        resultData += '                                                                <th scope="col">';
        resultData += '                                                                    wall putty';
        resultData += '                                                                </th>';
        resultData += '                                                                <th scope="col">';
        resultData += '                                                                    &nbsp;';
        resultData += '                                                                </th>';
        resultData += '                                                            </tr>';
        resultData += '                                                            <tr class="bdr-btm">';
        resultData += '                                                                <td height="51" align="left" valign="middle" class="small">';
        resultData += '                                                                    ' + PrimerName1 + '<br>';
        resultData += '                                                                    ' + TexturedPrimerQtyRequired + ' kg';
        resultData += '                                                                </td>';
        resultData += '                                                                <td align="left" valign="middle">';
        resultData += '                                                                    <p class="pr-top15">';
        resultData += '                                                                        <span class="icon-inr"></span>' + TexturedTotalPrimerCost + '';
        resultData += '                                                                    </p>';
        resultData += '                                                                 </td>';
        resultData += '                                                            </tr>';
        resultData += '                                                            <tr>';
        resultData += '                                                                <td height="51" align="left" valign="middle" class="small">';
        resultData += '                                                                    ' + PuttyName1 + '<br>';
        resultData += '                                                                    ' + TexturedPuttyQtyRequired + ' kg';
        resultData += '                                                                </td>';
        resultData += '                                                                <td align="left" valign="middle">';
        resultData += '                                                                     <p class="pr-top15">';
        resultData += '                                                                         <span class="icon-inr"></span>' + TexturedTotalPuttyCost + '';
        resultData += '                                                                    </p>';
        resultData += '                                                                </td>';
        resultData += '                                                            </tr>';
        resultData += '                                                        </table>';
        resultData += '                                                    </td>';
        resultData += '                                                </tr>';
        resultData += '                                            </table>';
        resultData += '                                        </div>';
        resultData += '                                    </div>';
        resultData += '                                    <div class="cost">';
        resultData += '                                        <span class="icon-inr"></span>' + TexturedTotalMaterialCost + '</div>';
        resultData += '                                </div>';
        resultData += '                                <div class="col-md-4 col-sm-5 hidden-xs paintImgWrapper">';
        resultData += '                                    <div class="paintImgDesc">';
        resultData += '                                        <div class="imgComt color-product-wrapper">';
        resultData += '                                            <img class="color-product-img" src="productImg/' + TexturedFinishProductImg + '">';
        resultData += '                                            <p class="color-name">' + TexturedFinishProduct + '</p>';
        resultData += '                                        </div>';
        resultData += '                                        <p>';
        resultData += '                                            ' + TexturedFinishProductDescription + '';
        resultData += '                                        </p>';
        resultData += '                                    </div>';
        resultData += '                                </div>';
        resultData += '                             </div>';
        resultData += '                        </div>';
    }
    //Doors Paint
    resultData += '                        <div class="brdr-secn clearfix">';
    resultData += '                            <h2 class="mb-25">';
    resultData += '                                 doors</h2>';
    resultData += '                            <div class="paintContainer clearfix mb-25">';
    //resultData += '                                <a class="close" href="javascript:void(0);">x</a>';
    resultData += '                                <div class="paintRequired col-md-8 col-sm-7 col-xs-12">';
    resultData += '                                    <div class="top-row row">';
    resultData += '                                        <div class="col-md-6 col-sm-6 col-xs-7">';
    resultData += '                                            <div class="faq-select-drop-down-item">';
    resultData += '                                                <div class="slct-style1 selectStrong mb-10">';
    resultData += '                                                    <select id ="ddlDoorsPaintProduct' + RoomId + '" class="selectpicker" onchange="ChangeDoorsPaintProduct(' + RoomId + ');">';
    resultData += '                                                        <option>select</option>';
    resultData += '                                                    </select>';
    resultData += '                                                </div>';
    resultData += '                                            </div>';
    resultData += '                                        </div>';
    resultData += '                                        <div class="col-md-6 col-sm-6 col-xs-5">';
    resultData += '                                            <div class="desc__bold">';
    resultData += '                                                <p>';
    resultData += '                                                    <span class="icon-inr"></span>  ' + DoorsPaintTotalTopCoat + ' ';
    resultData += '                                                </p>';
    resultData += '                                            </div>';
    resultData += '                                        </div>';
    resultData += '                                        <div class="col-md-12 col-xs-12">';
    resultData += '                                            ' + DoorsPaintQtyRequired + ' liters';
    resultData += '                                        </div>';
    resultData += '                                   </div>';
    resultData += '                                <div class="cost">';
    resultData += '                                        <span class="icon-inr"></span>' + DoorsPaintTotalTopCoat + '</div>';
    resultData += '                                </div>';
    resultData += '                                <div class="col-md-4 col-sm-5 hidden-xs paintImgWrapper">';
    resultData += '                                    <div class="paintImgDesc">';
    resultData += '                                        <div class="imgComt">';
    resultData += '                                            <p class="color-product-wrapper">';
    resultData += '                                                <img class="color-product-img" src="productImg/' + DoorsPaintProductImg + '">';
    resultData += '                                                <span class="color-name">' + DoorsPaintProduct + '</span>';
    resultData += '                                            </p>';
    resultData += '                                        </div>';
    resultData += '                                        <p>';
    resultData += '                                            ' + DoorsPaintProductDescription + '';
    resultData += '                                        </p>';
    resultData += '                                    </div>';
    resultData += '                                </div>';
    resultData += '                            </div>';
    resultData += '                        </div>';
    //Windows Paint
    resultData += '                        <div class="brdr-secn clearfix">';
    resultData += '                            <h2 class="mb-25">';
    resultData += '                                windows </h2>';
    resultData += '                            <div class="paintContainer clearfix mb-25">';
    //resultData += '                                <a class="close" href="javascript:void(0);">x</a>';
    resultData += '                                <div class="paintRequired col-md-8 col-sm-7 col-xs-12">';
    resultData += '                                    <div class="top-row row">';
    resultData += '                                        <div class="col-md-6 col-sm-6 col-xs-7">';
    resultData += '                                            <div class="faq-select-drop-down-item">';
    resultData += '                                                <div class="slct-style1 selectStrong mb-10">';
    resultData += '                                                    <select id ="ddlWindowsPaintProduct' + RoomId + '" class="selectpicker" onchange="ChangeWindowsPaintProduct(' + RoomId + ');">';
    resultData += '                                                        <option>select</option>';
    resultData += '                                                    </select>';
    resultData += '                                                </div>';
    resultData += '                                            </div>';
    resultData += '                                        </div>';
    resultData += '                                        <div class="col-md-6 col-sm-6 col-xs-5">';
    resultData += '                                            <div class="desc__bold">';
    resultData += '                                                <p>';
    resultData += '                                                    <span class="icon-inr"></span>  ' + WindowsPaintTotalTopCoat + ' ';
    resultData += '                                                </p>';
    resultData += '                                            </div>';
    resultData += '                                        </div>';
    resultData += '                                        <div class="col-md-12 col-xs-12">';
    resultData += '                                            ' + WindowsPaintQtyRequired + ' liters';
    resultData += '                                        </div>';
    resultData += '                                   </div>';
    resultData += '                                <div class="cost">';
    resultData += '                                        <span class="icon-inr"></span>' + WindowsPaintTotalTopCoat + '</div>';
    resultData += '                                </div>';
    resultData += '                                <div class="col-md-4 col-sm-5 hidden-xs paintImgWrapper">';
    resultData += '                                    <div class="paintImgDesc">';
    resultData += '                                        <div class="imgComt">';
    resultData += '                                            <p class="color-product-wrapper">';
    resultData += '                                                <img class="color-product-img" src="productImg/' + WindowsPaintProductImg + '">';
    resultData += '                                                <span class="color-name">' + WindowsPaintProduct + '</span>';
    resultData += '                                            </p>';
    resultData += '                                        </div>';
    resultData += '                                        <p>';
    resultData += '                                            ' + WindowsPaintProductDescription + '';
    resultData += '                                        </p>';
    resultData += '                                    </div>';
    resultData += '                                </div>';
    resultData += '                            </div>';
    resultData += '                        </div>';
    // Room estimate
    resultData += '                        <div class="col-md-12 no-mobile-padding no-float clearfix">';
    resultData += '                            <div class="cost totalCost">';
    resultData += '                                <span class="roomEstimat col-md-3 col-xs-6 no-mobile-padding">room ' + RoomId + ' estimate</span>';
    resultData += '                                <span class="col-md-6 col-xs-6 no-mobile-padding"><span class="icon-inr"></span>' + RoomEstimateTotal + '';
    resultData += '                                </span>';
    resultData += '                            </div>';
    resultData += '                        </div>';
    resultData += '                    </div>';

}

function CalulateDoorsPaintProduct(item, RoomId) {
    var productName;
    if (Flag == false) {
        productName = item.DoorsPaintProduct;
    }
    else {
        var ddlist = "ddlDoorsPaintProduct" + RoomId;
        productName = document.getElementById(ddlist).value;
    }

    var url = "Handlers/PaintCalculatorResult.ashx";
    var postData = {
        "Type": "1",
        "Location": item.Location,
        "System": item.System,
        "FinishType": 'Plain',
        "ProductName": productName
    }

    $.ajax({ url: url, data: postData, type: "GET", async: false, success: function (result) {

        $("#dvJSONPlainFinishProduct").html("<script>" + result + "<\/script>");
    }, error: function () { }
    });
    var sql = "select * from arrPaintCalculatorData";
    var arrProductFiltered = jsonsql.query(sql, arrPaintCalculatorData);

    for (var index = 0; index < arrProductFiltered.length; index++) {

        LLMTopCoat = arrProductFiltered[index].PaintLLMCost;
        ULMTopCoat = arrProductFiltered[index].PaintULMCost;
        PaintCoverage = arrProductFiltered[index].PaintCoverage;
        PaintNoCoats = arrProductFiltered[index].PaintNoCoats;

        DoorsPaintProduct = arrProductFiltered[index].ProductName;
        DoorsPaintProductImg = arrProductFiltered[index].Thumbimages;
        DoorsPaintProductDescription = arrProductFiltered[index].ProductDescription;
    }

    var TotalDoorArea = Door * 8 * 3;

    var LLTotalTopCoat = LLMTopCoat * TotalDoorArea;
    var ULTotalTopCoat = ULMTopCoat * TotalDoorArea;

    DoorsPaintQtyRequired = Math.round(PaintNoCoats * (TotalDoorArea / PaintCoverage));
    DoorsPaintTotalTopCoat = Math.round(LLTotalTopCoat) + ' to ' + Math.round(LLTotalTopCoat);

}




function CalulateWindowsPaintProduct(item, RoomId) {
    var productName;
    if (Flag == false) {
        productName = item.WindowsPaintProduct;
    }
    else {
        var ddlist = "ddlWindowsPaintProduct" + RoomId;
        productName = document.getElementById(ddlist).value;
    }

    var url = "Handlers/PaintCalculatorResult.ashx";
    var postData = {
        "Type": "1",
        "Location": item.Location,
        "System": item.System,
        "FinishType": 'Plain',
        "ProductName": productName
    }

    $.ajax({ url: url, data: postData, type: "GET", async: false, success: function (result) {

        $("#dvJSONPlainFinishProduct").html("<script>" + result + "<\/script>");
    }, error: function () { }
    });
    var sql = "select * from arrPaintCalculatorData";
    var arrProductFiltered = jsonsql.query(sql, arrPaintCalculatorData);

    for (var index = 0; index < arrProductFiltered.length; index++) {

        LLMTopCoat = arrProductFiltered[index].PaintLLMCost;
        ULMTopCoat = arrProductFiltered[index].PaintULMCost;
        PaintCoverage = arrProductFiltered[index].PaintCoverage;
        PaintNoCoats = arrProductFiltered[index].PaintNoCoats;

        WindowsPaintProduct = arrProductFiltered[index].ProductName;
        WindowsPaintProductImg = arrProductFiltered[index].Thumbimages;
        WindowsPaintProductDescription = arrProductFiltered[index].ProductDescription;
    }

    var TotalWindowArea = Window * 3 * 2;
    var LLTotalTopCoat = LLMTopCoat * TotalWindowArea;
    var ULTotalTopCoat = ULMTopCoat * TotalWindowArea;

    WindowsPaintQtyRequired = Math.round(PaintNoCoats * (TotalWindowArea / PaintCoverage));

    WindowsPaintTotalTopCoat = Math.round(LLTotalTopCoat) + ' to ' + Math.round(LLTotalTopCoat);

}



function fnBindDoorsPaintProduct(item, RoomId) {

    var ddlDoorsPaintProduct = "ddlDoorsPaintProduct" + RoomId;
    var url = "Handlers/PaintCalculator.ashx";
    var postData = {
        "Type": "1",
        "Location": item.Location,
        "System": item.System,
        "FinishType": 'Plain',
        "ProductName": ""
    }

    $.ajax({
        dataType: "jsonp",
        data: postData,
        url: url,
        async: false,
        type: "GET",
        success: function (result) {
            {
                var arrResult = result.split("*****");
                var objSelect = document.getElementById(ddlDoorsPaintProduct);
                for (i = 0; i < arrResult.length; i++) {
                    var option = document.createElement("option");
                    option.text = arrResult[i];
                    option.value = arrResult[i];
                    if (objSelect) {
                        try {
                            objSelect.add(option, objSelect.options[null]);
                        }
                        catch (e) {
                            objSelect.add(option, null);
                        }
                    }                    
                }

                if (Flag == false) {
                    document.getElementById("ddlDoorsPaintProduct" + RoomId).value = item.DoorsPaintProduct;
                    selectedDoorsPaintInRoomArr[RoomId - 1] = item.DoorsPaintProduct;
                    $('.selectpicker').selectpicker('refresh');
                } else {
                    document.getElementById("ddlDoorsPaintProduct" + RoomId).value = selectedDoorsPaintInRoomArr[RoomId - 1];
                    $('.selectpicker').selectpicker('refresh');
                }
            }

        },
        error: function (result) {

        }
    });

}


function fnBindWindowsPaintProduct(item, RoomId) {

    var ddlWindowsPaintProduct = "ddlWindowsPaintProduct" + RoomId;
    var url = "Handlers/PaintCalculator.ashx";
    var postData = {
        "Type": "1",
        "Location": item.Location,
        "System": item.System,
        "FinishType": 'Plain',
        "ProductName": ""
    }

    $.ajax({
        dataType: "jsonp",
        data: postData,
        url: url,
        async: false,
        type: "GET",
        success: function (result) {
            {
                var arrResult = result.split("*****");
                var objSelect = document.getElementById(ddlWindowsPaintProduct);
                for (i = 0; i < arrResult.length; i++) {
                    var option = document.createElement("option");
                    option.text = arrResult[i];
                    option.value = arrResult[i];
                    if (objSelect) {
                        try {
                            objSelect.add(option, objSelect.options[null]);
                        }
                        catch (e) {
                            objSelect.add(option, null);
                        }
                    }                    
                }

                if (Flag == false) {
                    document.getElementById("ddlWindowsPaintProduct" + RoomId).value = item.WindowsPaintProduct;
                    selectedWindowsPaintInRoomArr[RoomId - 1] = item.WindowsPaintProduct;
                    $('.selectpicker').selectpicker('refresh');
                } else {
                    document.getElementById("ddlWindowsPaintProduct" + RoomId).value = selectedWindowsPaintInRoomArr[RoomId - 1];
                    $('.selectpicker').selectpicker('refresh');
                }
            }

        },
        error: function (result) {

        }
    });

}

function FillOnChangeDoorsPaintDropDownList(Id) {
    var RoomId;
    var data = JSON.parse($.readCookie('AdvanceCalculatorData'));
    if (data != null || data != undefined) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            RoomId = i + 1;
            fnBindDoorsPaintProduct(item, RoomId);
        }
    }
}

function FillOnChangeWindowsPaintDropDownList(Id) {
    var RoomId;
    var data = JSON.parse($.readCookie('AdvanceCalculatorData'));
    if (data != null || data != undefined) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            RoomId = i + 1;
            fnBindWindowsPaintProduct(item, RoomId);
        }
    }
}

function ChangeDoorsPaintProduct(Id) {
    selectedDoorsPaintInRoomArr = [];
    var data = JSON.parse($.readCookie('AdvanceCalculatorData'));
    if (data != null || data != undefined) {
        for (var i = 0; i < data.length; i++) {
            var item = i + 1;
            var x = document.getElementById("ddlDoorsPaintProduct" + item).selectedIndex;
            var y = document.getElementById("ddlDoorsPaintProduct" + item).options;
            selectedDoorsPaintInRoomArr.push(y[x].text);
        }
    }

    Flag = true;
    getAdvanceCalculatorData();
    getData();
    FillOnChangePlainFinishDropDownList(Id);
    FillOnChangeTexturedFinishDropDownList(Id);
    FillOnChangeDoorsPaintDropDownList(Id);
    FillOnChangeWindowsPaintDropDownList(Id);
}

function ChangeWindowsPaintProduct(Id) {
    selectedWindowsPaintInRoomArr = [];
    var data = JSON.parse($.readCookie('AdvanceCalculatorData'));
    if (data != null || data != undefined) {
        for (var i = 0; i < data.length; i++) {
            var item = i + 1;
            var x = document.getElementById("ddlWindowsPaintProduct" + item).selectedIndex;
            var y = document.getElementById("ddlWindowsPaintProduct" + item).options;
            selectedWindowsPaintInRoomArr.push(y[x].text);
        }
    }

    Flag = true;
    getAdvanceCalculatorData();
    getData();
    FillOnChangePlainFinishDropDownList(Id);
    FillOnChangeTexturedFinishDropDownList(Id);
    FillOnChangeDoorsPaintDropDownList(Id);
    FillOnChangeWindowsPaintDropDownList(Id);
}


function ChangePlainFinishProduct(Id) {
    selectedPlainInRoomArr = [];
    var data = JSON.parse($.readCookie('AdvanceCalculatorData'));
    if (data != null || data != undefined) {
        for (var i = 0; i < data.length; i++) {
            var item = i + 1;
            var x = document.getElementById("ddlPlainFinishProduct" + item).selectedIndex;
            var y = document.getElementById("ddlPlainFinishProduct" + item).options;
            selectedPlainInRoomArr.push(y[x].text);
        }
    }

    Flag = true;
    getAdvanceCalculatorData();
    getData();
    FillOnChangePlainFinishDropDownList(Id);
    FillOnChangeTexturedFinishDropDownList(Id);
    FillOnChangeDoorsPaintDropDownList(Id);
    FillOnChangeWindowsPaintDropDownList(Id);
}

function ChangeTexturedFinishProduct(Id) {
    selectedTextureInRoomArr = [];
    var data = JSON.parse($.readCookie('AdvanceCalculatorData'));
    if (data != null || data != undefined) {
        for (var i = 0; i < data.length; i++) {
            var item = i + 1;
            var x = document.getElementById("ddlTexturedFinishProduct" + item).selectedIndex;
            var y = document.getElementById("ddlTexturedFinishProduct" + item).options;
            selectedTextureInRoomArr.push(y[x].text);
        }
    }

    Flag = true;
    getAdvanceCalculatorData();
    getData();
    FillOnChangePlainFinishDropDownList(Id);
    FillOnChangeTexturedFinishDropDownList(Id);
    FillOnChangeDoorsPaintDropDownList(Id);
    FillOnChangeWindowsPaintDropDownList(Id);
}

function FillDropDownList() {
    var RoomId;
    var data = JSON.parse($.readCookie('AdvanceCalculatorData'));
    if (data != null || data != undefined) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            RoomId = i + 1;
            fnBindPlainFinish(item, RoomId);
            if (document.getElementById("ddlPlainFinishProduct" + RoomId)) {
                document.getElementById("ddlPlainFinishProduct" + RoomId).value = item.PlainFinishProduct;
            }

            fnBindTexturedFinish(item, RoomId);
            if (document.getElementById("ddlTexturedFinishProduct" + RoomId)) {
                document.getElementById("ddlTexturedFinishProduct" + RoomId).value = item.TexturedFinishProduct;
            }            

            fnBindDoorsPaintProduct(item, RoomId);
            document.getElementById("ddlDoorsPaintProduct" + RoomId).value = item.DoorsPaintProduct;

            fnBindWindowsPaintProduct(item, RoomId);
            document.getElementById("ddlWindowsPaintProduct" + RoomId).value = item.WindowsPaintProduct;
        }
    }
}
function FillOnChangePlainFinishDropDownList(Id) {
    var RoomId;
    var data = JSON.parse($.readCookie('AdvanceCalculatorData'));
    if (data != null || data != undefined) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            RoomId = i + 1;
            fnBindPlainFinish(item, RoomId);
        }
    }
}

function FillOnChangeTexturedFinishDropDownList(Id) {
    var RoomId;
    var data = JSON.parse($.readCookie('AdvanceCalculatorData'));
    if (data != null || data != undefined) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            RoomId = i + 1;
            fnBindTexturedFinish(item, RoomId);
        }
    }
}

function fnBindPlainFinish(item, RoomId) {

    var ddlPlainFinishProduct = "ddlPlainFinishProduct" + RoomId;
    var url = "Handlers/PaintCalculator.ashx";
    var postData = {
        "Type": "1",
        "Location": item.Location,
        "System": item.System,
        "FinishType": 'Plain',
        "ProductName": ""
    }

    $.ajax({
        dataType: "jsonp",
        data: postData,
        url: url,
        async: false,
        type: "GET",
        success: function (result) {
            {
                var arrResult = result.split("*****");
                var objSelect = document.getElementById(ddlPlainFinishProduct);
                for (i = 0; i < arrResult.length; i++) {
                    var option = document.createElement("option");
                    option.text = arrResult[i];
                    option.value = arrResult[i];
                    if (objSelect) {
                        try {
                            objSelect.add(option, objSelect.options[null]);
                        }
                        catch (e) {
                            objSelect.add(option, null);
                        }
                    }
                }

                if (Flag == false) {
                    if (document.getElementById("ddlPlainFinishProduct" + RoomId)) {
                        document.getElementById("ddlPlainFinishProduct" + RoomId).value = item.PlainFinishProduct;
                        selectedPlainInRoomArr[RoomId - 1] = item.PlainFinishProduct;
                        $('.selectpicker').selectpicker('refresh');
                    }
                } else {
                    //alert("Plain Index : " + RoomId + " is " + selectedPlainInRoomArr[RoomId - 1]);
                    document.getElementById("ddlPlainFinishProduct" + RoomId).value = selectedPlainInRoomArr[RoomId - 1];
                    $('.selectpicker').selectpicker('refresh');
                }
            }

        },
        error: function (result) {

        }
    });

}

function fnBindTexturedFinish(item, RoomId) {
    var ddlTexturedFinishProduct = "ddlTexturedFinishProduct" + RoomId;
    var url = "Handlers/PaintCalculator.ashx";
    var postData = {
        "Type": "1",
        "Location": item.Location,
        "System": item.System,
        "FinishType": 'Textured',
        "ProductName": ""
    }

    $.ajax({
        dataType: "jsonp",
        data: postData,
        url: url,
        async: false,
        type: "GET",
        success: function (result) {
            {
                var arrResult = result.split("*****");
                var objSelect = document.getElementById(ddlTexturedFinishProduct);
                for (i = 0; i < arrResult.length; i++) {
                    var option = document.createElement("option");
                    option.text = arrResult[i];
                    option.value = arrResult[i];
                    if (objSelect) {
                        try {
                            objSelect.add(option, objSelect.options[null]);
                        }
                        catch (e) {
                            objSelect.add(option, null);
                        }
                    }
                }
                //

                if (Flag == false) {
                    if (document.getElementById("ddlTexturedFinishProduct" + RoomId)) {
                        document.getElementById("ddlTexturedFinishProduct" + RoomId).value = item.TexturedFinishProduct;
                        selectedTextureInRoomArr[RoomId - 1] = item.TexturedFinishProduct;
                        $('.selectpicker').selectpicker('refresh');
                    }
                } else {
                    //alert("Texture Index : " + RoomId + " is " + selectedTextureInRoomArr[RoomId - 1]);
                    document.getElementById("ddlTexturedFinishProduct" + RoomId).value = selectedTextureInRoomArr[RoomId - 1];
                    $('.selectpicker').selectpicker('refresh');
                }
            }
        },
        error: function (result) {

        }
    });
}

function CalulatePlainFinishProduct(item, RoomId) {
    var productName;
    if (Flag == false) {
        productName = item.PlainFinishProduct;
    }
    else {
        var ddlist = "ddlPlainFinishProduct" + RoomId;
        productName = document.getElementById(ddlist).value;
    }

    var url = "Handlers/PaintCalculatorResult.ashx";
    var postData = {
        "Type": "1",
        "Location": item.Location,
        "System": item.System,
        "FinishType": 'Plain',
        "ProductName": productName
    }

    $.ajax({ url: url, data: postData, type: "GET", async: false, success: function (result) {

        $("#dvJSONPlainFinishProduct").html("<script>" + result + "<\/script>");
    }, error: function () { }
    });
    var sql = "select * from arrPaintCalculatorData";
    var arrPlainFinishProductFiltered = jsonsql.query(sql, arrPaintCalculatorData);

    for (var index = 0; index < arrPlainFinishProductFiltered.length; index++) {

        LLMTopCoat = arrPlainFinishProductFiltered[index].PaintLLMCost;
        ULMTopCoat = arrPlainFinishProductFiltered[index].PaintULMCost;
        PaintCoverage = arrPlainFinishProductFiltered[index].PaintCoverage;
        PaintNoCoats = arrPlainFinishProductFiltered[index].PaintNoCoats;

        LLMPrimerCost = arrPlainFinishProductFiltered[index].PrimerLLMCost;
        ULMPrimerCost = arrPlainFinishProductFiltered[index].PrimerULMCost;
        PrimerName = arrPlainFinishProductFiltered[index].PrimerName;
        PrimerCoverage = arrPlainFinishProductFiltered[index].PrimerCoverage;
        PrimerNoCoats = arrPlainFinishProductFiltered[index].PrimerNoCoats;

        LLMPuttyCost = arrPlainFinishProductFiltered[index].PuttyLLMCost;
        ULMPuttyCost = arrPlainFinishProductFiltered[index].PuttyULMCost;
        PuttyName = arrPlainFinishProductFiltered[index].PuttyName;
        PuttyCoverage = arrPlainFinishProductFiltered[index].PuttyCoverage;
        PuttyNoCoats = arrPlainFinishProductFiltered[index].PuttyNoCoats;
        PlainFinishProduct = arrPlainFinishProductFiltered[index].ProductName;
        PlainFinishProductImg = arrPlainFinishProductFiltered[index].Thumbimages;
        PlainFinishProductDescription = arrPlainFinishProductFiltered[index].ProductDescription;
    }
    var RoomWall1 = 0, RoomWall2 = 0, RoomWall3 = 0, RoomWall4 = 0;

    if (RoomLeft == 'plain') {
        RoomWall1 = Width * Height;
    }

    if (RoomRight == 'plain') {
        RoomWall2 = Width * Height;
    }

    if (Roomtop == 'plain') {
        RoomWall3 = Length * Height;
    }

    if (Roombottom == 'plain') {
        RoomWall4 = Length * Height;
    }

    RoomRoof = Width * Length;

    totalPlainArea = RoomWall1 + RoomWall2 + RoomWall3 + RoomWall4 + RoomRoof;



    var LLTotalSurfaceArea = 2 * Height * (Length + Width) + Length * Width;
    var LLTotalDoorArea = Door * 8 * 3;
    var LLTotalWindowArea = Window * 3 * 2;

    var plainPercent = 100 * totalPlainArea / LLTotalSurfaceArea;

    var LLTotalPaintableArea;

    if (item.Location == 'interior') {
        LLTotalPaintableArea = LLTotalSurfaceArea - LLTotalDoorArea - LLTotalWindowArea;
    }
    else {
        LLTotalPaintableArea = LLTotalSurfaceArea;
    }

    var updatedLLPlainArea = LLTotalPaintableArea * plainPercent / 100;

    var LLTotalCostofMaterial = LLMTopCoat + LLMPrimerCost + LLMPuttyCost;
    var LLTotalTopCoat = LLMTopCoat * updatedLLPlainArea;
    var LLTotalPrimerCost = LLMPrimerCost * updatedLLPlainArea;
    var LLTotalPuttyCost = LLMPuttyCost * updatedLLPlainArea;
    var LLTotalMaterialCost = LLTotalCostofMaterial * updatedLLPlainArea;
    PlainLLTotalMaterialCost = LLTotalCostofMaterial * updatedLLPlainArea;

    var ULTotalSurfaceArea = 2 * Height * (Length + Width) + Length * Width;
    var ULTotalDoorArea = Door * 8 * 3;
    var ULTotalWindowArea = Window * 3 * 2;
    var ULTotalPaintableArea;
    if (item.Location == 'interior') {
        ULTotalPaintableArea = ULTotalSurfaceArea - ULTotalDoorArea - ULTotalWindowArea;
    }
    else {
        ULTotalPaintableArea = ULTotalSurfaceArea;
    }

    var updatedULPlainArea = ULTotalPaintableArea * plainPercent / 100;

    var ULTotalCostofMaterial = ULMTopCoat + ULMPrimerCost + ULMPuttyCost;

    var ULTotalTopCoat = ULMTopCoat * updatedULPlainArea;
    var ULTotalPrimerCost = ULMPrimerCost * updatedULPlainArea;
    var ULTotalPuttyCost = ULMPuttyCost * updatedULPlainArea;
    var ULTotalMaterialCost = ULTotalCostofMaterial * updatedULPlainArea;
    PlainULTotalMaterialCost = ULTotalCostofMaterial * updatedULPlainArea;

    PlainProductQtyRequired = Math.round(PaintNoCoats * (updatedULPlainArea / PaintCoverage));
    PlainPrimerQtyRequired = Math.round(PrimerNoCoats * (updatedULPlainArea / PrimerCoverage));
    PlainPuttyQtyRequired = Math.round(PuttyNoCoats * (updatedULPlainArea / PuttyCoverage));

    PlainTotalTopCoat = Math.round(LLTotalTopCoat) + ' to ' + Math.round(ULTotalTopCoat);
    PlainTotalPrimerCost = Math.round(LLTotalPrimerCost) + ' to ' + Math.round(ULTotalPrimerCost);
    PlainTotalPuttyCost = Math.round(LLTotalPuttyCost) + ' to ' + Math.round(ULTotalPuttyCost);
    PlainTotalMaterialCost = Math.round(LLTotalMaterialCost) + ' to ' + Math.round(ULTotalMaterialCost);


    RoomEstimateTotal = Math.round(PlainLLTotalMaterialCost) + ' to ' + Math.round(PlainULTotalMaterialCost);

    RoomLLEstimatesubTotal = Math.round(PlainLLTotalMaterialCost);
    RoomULEstimatesubTotal = Math.round(PlainULTotalMaterialCost);

    TotalEstimate = (RoomLLEstimatesubTotal) + 'to' + (RoomULEstimatesubTotal);
}




function CalulateTexturedFinishProduct(item, RoomId) {
    var productName;
    if (Flag == false) {
        productName = item.TexturedFinishProduct;
    }
    else {
        var ddlist = "ddlTexturedFinishProduct" + RoomId;
        productName = document.getElementById(ddlist).value;
    }

    var url = "Handlers/PaintCalculatorResult.ashx";
    var postData = {
        "Type": "1",
        "Location": item.Location,
        "System": item.System,
        "FinishType": 'Textured',
        "ProductName": productName
    }

    $.ajax({ url: url, data: postData, type: "GET", async: false, success: function (result) {

        $("#dvJSONPlainFinishProduct").html("<script>" + result + "<\/script>");
    }, error: function () { }
    });
    var sql = "select * from arrPaintCalculatorData";
    var arrPlainFinishProductFiltered = jsonsql.query(sql, arrPaintCalculatorData);

    for (var index = 0; index < arrPlainFinishProductFiltered.length; index++) {
        LLMTopCoat = arrPlainFinishProductFiltered[index].PaintLLMCost;
        ULMTopCoat = arrPlainFinishProductFiltered[index].PaintULMCost;
        PaintCoverage = arrPlainFinishProductFiltered[index].PaintCoverage;
        PaintNoCoats = arrPlainFinishProductFiltered[index].PaintNoCoats;

        LLMPrimerCost = arrPlainFinishProductFiltered[index].PrimerLLMCost;
        ULMPrimerCost = arrPlainFinishProductFiltered[index].PrimerULMCost;
        PrimerName1 = arrPlainFinishProductFiltered[index].PrimerName;
        PrimerCoverage = arrPlainFinishProductFiltered[index].PrimerCoverage;
        PrimerNoCoats = arrPlainFinishProductFiltered[index].PrimerNoCoats;

        LLMPuttyCost = arrPlainFinishProductFiltered[index].PuttyLLMCost;
        ULMPuttyCost = arrPlainFinishProductFiltered[index].PuttyULMCost;
        PuttyName1 = arrPlainFinishProductFiltered[index].PuttyName;
        PuttyCoverage = arrPlainFinishProductFiltered[index].PuttyCoverage;
        PuttyNoCoats = arrPlainFinishProductFiltered[index].PuttyNoCoats;
        TexturedFinishProduct = arrPlainFinishProductFiltered[index].ProductName;
        TexturedFinishProductImg = arrPlainFinishProductFiltered[index].Thumbimages;
        TexturedFinishProductDescription = arrPlainFinishProductFiltered[index].ProductDescription;
    }

    var RoomWall1 = 0, RoomWall2 = 0, RoomWall3 = 0, RoomWall4 = 0, totalTextureArea = 0;

    if (RoomLeft == 'textured') {
        RoomWall1 = Width * Height;
    }

    if (RoomRight == 'textured') {
        RoomWall2 = Width * Height;
    }

    if (Roomtop == 'textured') {
        RoomWall3 = Length * Height;
    }

    if (Roombottom == 'textured') {
        RoomWall4 = Length * Height;
    }

    totalTextureArea = RoomWall1 + RoomWall2 + RoomWall3 + RoomWall4;

    var LLTotalSurfaceArea = 2 * Height * (Length + Width) + Length * Width;
    var LLTotalDoorArea = Door * 8 * 3;
    var LLTotalWindowArea = Window * 3 * 2;

    var texturePercent = 100 * totalTextureArea / LLTotalSurfaceArea;

    var LLTotalPaintableArea;
    if (item.Location == 'interior') {
        LLTotalPaintableArea = LLTotalSurfaceArea - LLTotalDoorArea - LLTotalWindowArea;
    }
    else {
        LLTotalPaintableArea = LLTotalSurfaceArea;
    }
    var updatedLLTextureArea = LLTotalPaintableArea * texturePercent / 100;

    var LLTotalCostofMaterial = LLMTopCoat + LLMPrimerCost + LLMPuttyCost;

    var LLTotalTopCoat = LLMTopCoat * updatedLLTextureArea;
    var LLTotalPrimerCost = LLMPrimerCost * updatedLLTextureArea;
    var LLTotalPuttyCost = LLMPuttyCost * updatedLLTextureArea;
    var LLTotalMaterialCost = LLTotalCostofMaterial * updatedLLTextureArea;
    TexturedLLTotalMaterialCost = LLTotalCostofMaterial * updatedLLTextureArea;

    var ULTotalSurfaceArea = 2 * Height * (Length + Width) + Length * Width;
    var ULTotalDoorArea = Door * 8 * 3;
    var ULTotalWindowArea = Window * 3 * 2;
    var ULTotalPaintableArea;
    if (item.Location == 'interior') {
        ULTotalPaintableArea = ULTotalSurfaceArea - ULTotalDoorArea - ULTotalWindowArea;
    }
    else {
        ULTotalPaintableArea = ULTotalSurfaceArea;
    }
    var updatedULTextureArea = ULTotalPaintableArea * texturePercent / 100;
    var ULTotalCostofMaterial = ULMTopCoat + ULMPrimerCost + ULMPuttyCost;

    var ULTotalTopCoat = ULMTopCoat * updatedULTextureArea;
    var ULTotalPrimerCost = ULMPrimerCost * updatedULTextureArea;
    var ULTotalPuttyCost = ULMPuttyCost * updatedULTextureArea;
    var ULTotalMaterialCost = ULTotalCostofMaterial * updatedULTextureArea;
    TexturedULTotalMaterialCost = ULTotalCostofMaterial * updatedULTextureArea;


    TexturedProductQtyRequired = Math.round(PaintNoCoats * (updatedULTextureArea / PaintCoverage));
    TexturedPrimerQtyRequired = Math.round(PrimerNoCoats * (updatedULTextureArea / PrimerCoverage));
    TexturedPuttyQtyRequired = Math.round(PuttyNoCoats * (updatedULTextureArea / PuttyCoverage));

    TexturedTotalTopCoat = Math.round(LLTotalTopCoat) + ' to ' + Math.round(ULTotalTopCoat);
    TexturedTotalPrimerCost = Math.round(LLTotalPrimerCost) + ' to ' + Math.round(ULTotalPrimerCost);
    TexturedTotalPuttyCost = Math.round(LLTotalPuttyCost) + ' to ' + Math.round(ULTotalPuttyCost);
    TexturedTotalMaterialCost = Math.round(LLTotalMaterialCost) + ' to ' + Math.round(ULTotalMaterialCost);

    if (isNaN(PlainLLTotalMaterialCost)) {
        PlainLLTotalMaterialCost = 0;
    }
    if (isNaN(TexturedLLTotalMaterialCost)) {
        TexturedLLTotalMaterialCost = 0;
    }
    if (isNaN(PlainULTotalMaterialCost)) {
        PlainULTotalMaterialCost = 0;
    }
    if (isNaN(TexturedULTotalMaterialCost)) {
        TexturedULTotalMaterialCost = 0;
    }
    if (isNaN(RoomLLEstimatesubTotal)) {
        RoomLLEstimatesubTotal = 0;
    }
    if (isNaN(RoomULEstimatesubTotal)) {
        RoomULEstimatesubTotal = 0;
    }

    RoomEstimateTotal = Math.round(PlainLLTotalMaterialCost + TexturedLLTotalMaterialCost) + ' to ' + Math.round(PlainULTotalMaterialCost + TexturedULTotalMaterialCost);

    

    RoomLLEstimatesubTotal = RoomLLEstimatesubTotal + Math.round(PlainLLTotalMaterialCost + TexturedLLTotalMaterialCost);
    RoomULEstimatesubTotal = RoomULEstimatesubTotal + Math.round(PlainULTotalMaterialCost + TexturedULTotalMaterialCost);

    TotalEstimate = (RoomLLEstimatesubTotal) + ' to ' + (RoomULEstimatesubTotal);
}






