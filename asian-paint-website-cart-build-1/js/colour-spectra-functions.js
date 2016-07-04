var arrChosenTexture = [];
var arrChosenShades = [];
var arrRepaintShades = [];
var smilarComShadeCount = 0;
function fnGetJSONDataByCategory(type)
{
    var postData = {
        "type": type
    };
    $.ajax({ async: false, mehtod:"Post",data:postData, url: "handlers/get-colour-spectra-json-data.ashx", success: function (result) {
        $("#dvJSONData").html("<script>" + result + "<\/script>");
        if (type == "colourfamily")
            fnDisplayShadesFamily();
        else if (type == "metalliccolours")
            fnDisplayMetalicShadesCategory();
        else if (type == "latesttrends")
            fnDisplayLatestTrendShadesCategory();
        else if (type == "textures")
            fnDisplayRoyalePlayTextureData();
    },
        error: function () {
        }
    });
}

///// Textures Section
function fnDisplayRoyalePlayTextureData() {
    var textureFamilyData = "";
    var sqlTextureFamily = "select * from arrTextureFamily where (category_id=1)";
    var arrTextureFamilyFiltered = jsonsql.query(sqlTextureFamily, arrShades);

    if (arrTextureFamilyFiltered.length > 0) {
        try {
            textureFamilyData += "<ul class='sldr1 color-patch-sldr'>";
            for (var index = 0; index < arrTextureFamilyFiltered.length; index++) {

                textureFamilyData += " <li data-id='" + arrTextureFamilyFiltered[index].id + "' " + (index == 0 ? "class='active'" : "") + ">";
                textureFamilyData += "<a data-toggle='tab' href='#infinitex'>";
                textureFamilyData += " <span class='prdct-name'>" + arrTextureFamilyFiltered[index].texture_family_name + "</span>";
                textureFamilyData += " <span class='arrw2 actv'></span>";
                textureFamilyData += " </a>";
                textureFamilyData += " </li>";

            }
            textureFamilyData += "</ul>";
        }
        catch (exception) {
            alert(arrShadesFiltered.length);
        }
        $("#dvRoyaleTextureFamily").html(textureFamilyData);
		
		setTimeout(function(){
        if ($(window).width() < 768) {
            $('#dvRoyaleTextureFamily .sldr1.color-patch-sldr').bxSlider({
                mode: 'horizontal',
                minSlides: 2,
                maxSlides: 2,
                sliderWidth: 130,
                sliderMargin:0,
                pager: false,
                infiniteLoop: false,
                hideControlOnEnd: true
            });
        }else{$('#dvRoyaleTextureFamily .sldr1.color-patch-sldr').bxSlider({
                mode: 'vertical',
                minSlides: 7,
                maxSlides: 7,
                sliderWidth: 130,
                sliderMargin:0,
                pager: false,
                infiniteLoop: false,
                hideControlOnEnd: true
            });}
},10)
        fnBindRoyaleTextureByTextureFamily();

        fnAttachFunctionToDisplayTextureByTextureFamily();
        $("#dvGoesWellWith").html("");
        $("#dvProducts").html("");
    }
    else {

        $("#dvGoesWellWith").html("");
        $("#dvProducts").html("");

    }

}
function fnBindRoyaleTextureByTextureFamily() {
    var textureData = "";
    var selectedTextureFamilies = "";
    $("#dvRoyaleTextureFamily ul li.active").each(function () {
        selectedTextureFamilies += " texture_family_id=='" + $(this).data("id") + "' || ";
    });

    if (selectedTextureFamilies != "")
        selectedTextureFamilies = selectedTextureFamilies.substring(0, selectedTextureFamilies.length - 3);
    var sqlTexture = "select * from arrTextures where (" + selectedTextureFamilies + ")";
    var arrTextureFiltered = jsonsql.query(sqlTexture, arrShades);
    if (arrTextureFiltered.length > 0) {
        try {
            textureData += "<ul class='color-catgry-sldr'>";
            for (var index = 0; index < arrTextureFiltered.length; index++) {
                textureData += "<li data-id='" + arrTextureFiltered[index].id + "' " + (index == 0 ? "class='active'" : "") + ">";
                textureData+="<a data-toggle='tab' href='#infinitex-tab1'>";
                textureData+="<span class='catgry-img'>";
                textureData += "<img src='resourcecontent/texture-images/" + arrTextureFiltered[index].texture_image + "' alt='Image'>";
                textureData+="</span>";
                textureData += "<p class='catgry-name'>" + arrTextureFiltered[index].texture_name + "</p>";
                textureData+="</a>";
                textureData += "</li>";

            }
            textureData += "</ul>";
        }
        catch (exception) {
            alert(arrShadesFiltered.length);
        }
        $("#dvRoyaleTextures").html(textureData);
        fnBindRoyaletextureCombinaton();
        fnAttachFunctionForTextureCombination();
        //had to add settimeout because otherwise the bxslider code was taking value 0
        setTimeout(function () {
            if ($(window).width() >= 768) {
                $('#dvRoyaleTextures .color-catgry-sldr').bxSlider({
                    mode: 'vertical',
                    minSlides: 3,
                    pager: false,
                    infiniteLoop: false,
                    hideControlOnEnd: true
                });

            }
            else {
                $('#dvRoyaleTextures .color-catgry-sldr').bxSlider({
                    mode: 'horizontal',
                    minSlides: 2,
                    pager: false,
                    infiniteLoop: false,
                    hideControlOnEnd: true
                });
            }        
        },10);
    }
    $("#dvGoesWellWith").html("");
    $("#dvProducts").html("");
}
function fnAttachFunctionToDisplayTextureByTextureFamily() {

    $("#dvRoyaleTextureFamily ul li").click(function () {
        $("#dvRoyaleTextureFamily ul li").removeClass("active");
        $(this).addClass("active");
        fnBindRoyaleTextureByTextureFamily();
		if($(window).width()<480){
		$("html, body").animate({ scrollTop: $(this).parent('ul').parent('div').siblings('.shade-col').offset().top - $('.main-header').height() - 20});}
    });
}

function fnBindRoyaletextureCombinaton() {

    var textureCombData = "";
    var selectedTextures = "";
    $("#dvRoyaleTextures ul li.active").each(function () {
        selectedTextures += " texture_id=='" + $(this).data("id") + "' || ";
    });

    if (selectedTextures != "")
        selectedTextures = selectedTextures.substring(0, selectedTextures.length - 3);
    var sqlTexture = "select * from arrTexturesCombinations where (" + selectedTextures + ")";
    var arrTextureFiltered = jsonsql.query(sqlTexture, arrShades);
    if (arrTextureFiltered.length > 0) {
        try {
            for (var index = 0; index < arrTextureFiltered.length; index++) {
                textureCombData += "<li "+(index == 0 ? " class='active' " : "")+" data-id='" + arrTextureFiltered[index].texture_id + "'>";
                textureCombData += "<a href='javascript:;' data-toggle='tooltip' data-placement='top' title='' data-original-title='" + arrTextureFiltered[index].combination_id + "'>";
                textureCombData += "<span class='shade-box actv'>";
                var imageNumber = (index + 1) % 6;
                if (imageNumber == 0)
                    imageNumber = 1;
                textureCombData += "<img alt='Image' src='resourcecontent/texture-combination-images/" + arrTextureFiltered[index].combination_image + "'></span>";
                textureCombData += "</a>";
                textureCombData += "</li>";
            }
        }
        catch (exception) {
        }
        $("#infinitex-tab1").html(textureCombData);
        if ($(window).width() > 1199) {

            $('.color-patches li .tooltip-show').tooltip('show');

            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                $('.color-patches li .tooltip-show').tooltip('show');
            });

            $('.color-patches li a').click(function () {
                $('.color-patches li .tooltip').removeClass('in')
                $(this).parent().children('.tooltip').addClass('in')
            });

            $('[data-toggle="tooltip"]').tooltip({
                placement: 'top'
            });

        }
         
        fnBindRoyaleTextureInfo(arrTextureFiltered[0].texture_id);
        fnAttachFunctionForTextureInfo();
    }
    else {


    }
    $("#dvGoesWellWith").html("");
    $("#dvProducts").html("");
}
function fnAttachFunctionForTextureCombination() {
    $("#dvRoyaleTextures ul li").click(function () {
        $("#dvRoyaleTextures ul li").removeClass("active");
        $(this).addClass("active");
        fnBindRoyaletextureCombinaton();
		if($(window).width()<480){
		$("html, body").animate({ scrollTop: $(this).parent('ul').parent('div').siblings('.shade-col').offset().top - $('.main-header').height() - 20});}
    });
}
function fnBindRoyaleTextureInfo(id) {

    var textureInfoData = "";
    var image = "";

    var image = $("#infinitex-tab1 li.active").find("img").attr("src");
    var sqlTexture = "select * from arrTextures where (id==" + id + ")";
    var arrTextureFiltered = jsonsql.query(sqlTexture, arrShades);
    if (arrTextureFiltered.length > 0) {
        // here you have to add heart code
        textureInfoData += "<h4 class='mb-10 bold'></h4>";
        textureInfoData += "<div class='shade mb-10' style='background-image: url(\"" + image + "\");'>";
		textureInfoData += "<div class='like-icon  " + (IsExistInFavTextureCookie(arrTextureFiltered[0].id) ? "actv" : "") + "' data-textureid='" + arrTextureFiltered[0].id + "'></div>";
        textureInfoData += "</div>";
        textureInfoData += "<div class='mb-15'>";
        //textureInfoData+="<p class='mb-none'>base coat</p>";
        textureInfoData += "<p class='bold'>" + arrTextureFiltered[0].texture_name + "</p>";
        textureInfoData += "</div>";
        textureInfoData += "<div>";
        //textureInfoData+="<p class='mb-none'>bw white top coat</p>";
        //textureInfoData+="<p class='bold'>myrtle  m218</p>";
        textureInfoData += "</div>";
    }

    $("#dvRoyaletextureInfo").html(textureInfoData);
    fnMakeTextureHeartSelectable("dvRoyaletextureInfo");
//    setTimeout(function () {
//        $('#dvRoyaletextureInfo .shade').height($('#dvRoyaletextureInfo .shade').width() + "px");
//    }, 1);

    $("#dvGoesWellWith").html("");
    $("#dvProducts").html("");
}
function fnAttachFunctionForTextureInfo() {
    $("#infinitex-tab1 li").click(function () {
        $("#infinitex-tab1 li").removeClass("active");
        $(this).addClass("active");
        fnBindRoyaleTextureInfo($(this).data("id"));
		if($(window).width()<480){
		$("html, body").animate({ scrollTop: $(this).parent('ul').parent('div').siblings('.shade-col').offset().top - $('.main-header').height() - 20});
		}
    });
}
///////



function fnDisplayMetalicShadesCategory() {
   var arrMetalicShadeCatgeory = _.uniq(arrShades,function(item) {
        return item.shade_category;
   });
   
   var metalicShadeCategory = "";
   var count = 0;
   for (var index = 0; index < arrMetalicShadeCatgeory.length; index++) {
       if (arrMetalicShadeCatgeory[index].shade_category.indexOf(",") == -1) {
           metalicShadeCategory += "<li " + (count == 0 ? "class='active'" : "") + "><a data-toggle='tab' onclick='fnDisplayMetalicShadesSubCategory();' href='#intr' data-type='" + arrMetalicShadeCatgeory[index].shade_category + "'>" + arrMetalicShadeCatgeory[index].shade_category.replace("metalic", "") + "</a></li>";
           count++;
       }
   }
   $("#dvMetalicShadeCategory").html(metalicShadeCategory);
       fnDisplayMetalicShadesSubCategory();
 
}
function fnDisplayLatestTrendShadesCategory() {
    var arrLatestTrendShadeCatgeory = _.uniq(arrShades, function (item) {
        return item.shade_category;
    });

    var latestTrendShadeCategory = "";
    var count = 0;
    for (var index = 0; index < arrLatestTrendShadeCatgeory.length; index++) {
        if (arrLatestTrendShadeCatgeory[index].shade_category.indexOf(",") == -1) {
            latestTrendShadeCategory += "<li " + (count == 0 ? "class='active'" : "") + "><a data-toggle='tab' onclick='fnDisplayLatestTrendShadesSubCategory();' href='#intr' data-type='" + arrLatestTrendShadeCatgeory[index].shade_category + "'>" + arrLatestTrendShadeCatgeory[index].shade_category.replace("latesttrend", "") + "</a></li>";
            count++;
        }
    }
    $("#dvLatestTrendShadeCategory").html(latestTrendShadeCategory);
    fnDisplayLatestTrendShadesSubCategory();
	

}
function fnDisplayLatestTrendShadesSubCategory() {
    setTimeout(function () {
        var category = "";
        if ($("#dvLatestTrendShadeCategory li.active").length > 0) {
            category = $("#dvLatestTrendShadeCategory li.active").find("a").data("type");
        }
        var sqlShades = "select * from arrShades where (shade_category.indexOf('" + category + "')!=-1)";
        var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
        var arrLatestTrendShadeSubCatgeory = _.uniq(arrShadesFiltered, function (item) {
            return item.latestTrendSubcategory;
        });
        var latestTrendShadeSubCategory = "";
        var count = 0;
        for (var index = 0; index < arrLatestTrendShadeSubCatgeory.length; index++) {
            if (arrLatestTrendShadeSubCatgeory[index].latestTrendSubcategory != "") {
                latestTrendShadeSubCategory += "<li " + (count == 0 ? "class='active'" : "") + ">";
                latestTrendShadeSubCategory += "<a href='#aspira' data-toggle='tab' data-type='" + arrLatestTrendShadeSubCatgeory[index].latestTrendSubcategory + "'>";
                latestTrendShadeSubCategory += "<span class='prdct-name'>" + arrLatestTrendShadeSubCatgeory[index].latestTrendSubcategory + "</span>";
                latestTrendShadeSubCategory += "<span class='arrw2 actv'></span>";
                latestTrendShadeSubCategory += "</a>";
                latestTrendShadeSubCategory += "</li>";
                count++;
            }
        }
        $("#dvLatestTrends").html('<ul class="sldr1 color-patch-sldr" id="dvLatestTrendShadeSubCategory">' + latestTrendShadeSubCategory + '</ul>');
        fnAttachFunctionToDisplayLatestTrendShades();
        fnDisplayLatestTrendsShadesData();
        setTimeout(function () {
            if ($(window).width() < 768) {
                $('#dvLatestTrends .sldr1.color-patch-sldr').bxSlider({
                    mode: 'horizontal',
                    minSlides: 2,
                    maxSlides: 2,
                    sliderWidth: 130,
                    sliderMargin: 0,
                    pager: false,
                    infiniteLoop: false,
                    hideControlOnEnd: true
                });
            }else{$('#dvLatestTrends .sldr1.color-patch-sldr').bxSlider({
                    mode: 'vertical',
                    minSlides: 7,
                    maxSlides: 7,
                    sliderWidth: 130,
                    sliderMargin: 0,
                    pager: false,
                    infiniteLoop: false,
                    hideControlOnEnd: true
                });}
        });
    }, 100);

  
}
function fnDisplayMetalicShadesSubCategory() {
    setTimeout(function () {
        var category = "";
        if ($("#dvMetalicShadeCategory li.active").length > 0) {
            category = $("#dvMetalicShadeCategory li.active").find("a").data("type");
        }    
        var sqlShades = "select * from arrShades where (shade_category.indexOf('" + category + "')!=-1)";
        var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
        var arrMetalicShadeSubCatgeory = _.uniq(arrShadesFiltered, function (item) {
            return item.metalicShadeSubCategory;
        });
        var metalicShadeSubCategory = "";
        var count = 0;
        for (var index = 0; index < arrMetalicShadeSubCatgeory.length; index++) {
            if (arrMetalicShadeSubCatgeory[index].metalicShadeSubCategory!="") {
                metalicShadeSubCategory += "<li " + (count == 0 ? "class='active'" : "") + ">";
                metalicShadeSubCategory += "<a href='#aspira' data-toggle='tab' data-type='" + arrMetalicShadeSubCatgeory[index].metalicShadeSubCategory + "'>";
                metalicShadeSubCategory += "<span class='prdct-name'>" + arrMetalicShadeSubCatgeory[index].metalicShadeSubCategory + "</span>";
                metalicShadeSubCategory += "<span class='arrw2 actv'></span>";
                metalicShadeSubCategory += "</a>";
                metalicShadeSubCategory += "</li>";
                count++;
            }
        }
        $("#dvMetalicShadeSubCategoryContainer").html('<ul class="color-patch-sldr" id="dvMetalicShadeSubCategory">' + metalicShadeSubCategory + '</ul>');
        setTimeout(function () {
            if ($(window).width() < 768) {
                $('#dvMetalicShadeSubCategoryContainer .color-patch-sldr').bxSlider({
                    mode: 'horizontal',
                    minSlides: 2,
                    maxSlides: 2,
                    sliderWidth: 130,
                    sliderMargin: 0,
                    pager: false,
                    infiniteLoop: false,
                    hideControlOnEnd: true
                });
            } else {
                $('#dvMetalicShadeSubCategoryContainer .color-patch-sldr').bxSlider({
                    mode: 'vertical',
                    minSlides: 7,
                    maxSlides: 7,
                    sliderWidth: 130,
                    sliderMargin: 0,
                    pager: false,
                    infiniteLoop: false,
                    hideControlOnEnd: true
                });
            }
        }, 10)

        fnAttachFunctionToDisplayMetalicShades();
        fnDisplayMetalicShadesData();
		
    },100);
}
function fnAttachFunctionToDisplayMetalicShades() {
    $("#dvMetalicShadeSubCategory li").click(function () {
        setTimeout(function () {
        fnDisplayMetalicShadesData();
        }, 100);
    });
}
function fnAttachFunctionToDisplayLatestTrendShades() {
    $("#dvLatestTrendShadeSubCategory li").click(function ()
    {
        setTimeout(function () {
        fnDisplayLatestTrendsShadesData();
        }, 100);
    });
}
function fnDisplayMetalicShadesData() {
    var category = "";
    if ($("#dvMetalicShadeCategory li.active").length > 0) {
        category = $("#dvMetalicShadeCategory li.active").find("a").data("type");
    }
    var subcategory = "";
    if ($("#dvMetalicShadeSubCategory li.active").length > 0) {
        subcategory = $("#dvMetalicShadeSubCategory li.active").find("a").data("type");
    }
    
    var shadesData = "";
    var sqlShades = "select * from arrShades where (shade_category.indexOf('" + category + "')!=-1 && metalicShadeSubCategory=='"+subcategory+"')";
    var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
    if (arrShadesFiltered.length > 0)
    {
        try {
            shadesData += "<ul id='aspira' class='tab-pane active color-patches clearfix'>";
            for (var index = 0; index < arrShadesFiltered.length; index++) {
                shadesData += " <li data-shadeid='" + arrShadesFiltered[index].id + "'><a href='javascript:;' title='' data-toggle='tooltip' data-placement='top' data-original-title='" + arrShadesFiltered[index].shade_code + " " + arrShadesFiltered[index].shade_name + "'><span class='color-box3' style='background-color: rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ");'></span></a></li>";
            }
            shadesData += "</ul>";
        }
        catch (exception) {
            alert(arrShadesFiltered.length);
        }
        $("#dvMetalicShades").html(shadesData);
        $("#dvGoesWellWith").html("");
        $("#dvProducts").html("");

        if ($(window).width() > 1199) {

            $('.color-patches li .tooltip-show').tooltip('show');

            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                $('.color-patches li .tooltip-show').tooltip('show');
            });

            $('.color-patches li a').click(function () {
                $('.color-patches li .tooltip').removeClass('in')
                $(this).parent().children('.tooltip').addClass('in')
            });

            $('[data-toggle="tooltip"]').tooltip({
                placement: 'top'
            });

        }

        //display Similar Shades, Complimentary Shades, And Products for first time
        fnDisplayMetalicShadedInfoSimilarAndComplimentaryShades(arrShadesFiltered[0].id);
        fnAttachedFunctionToDisplayMetalicShadeInfo();
    }
    else {
        $("#dvMetalicShades").html(shadesData);
        $("#dvGoesWellWith").html("");
        $("#dvProducts").html("");

    }

}
function fnDisplayLatestTrendsShadesData() {
    var category = "";
    if ($("#dvLatestTrendShadeCategory li.active").length > 0) {
        category = $("#dvLatestTrendShadeCategory li.active").find("a").data("type");
    }
    var subcategory = "";
    if ($("#dvLatestTrendShadeSubCategory li.active").length > 0) {
        subcategory = $("#dvLatestTrendShadeSubCategory li.active").find("a").data("type");
    }

    var shadesData = "";
    var sqlShades = "select * from arrShades where (shade_category.indexOf('" + category + "')!=-1 && latestTrendSubcategory=='" + subcategory + "')";
    var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
    if (arrShadesFiltered.length > 0) {
        try {
            shadesData += "<ul id='aspira' class='tab-pane active color-patches clearfix'>";
            for (var index = 0; index < arrShadesFiltered.length; index++) {
                shadesData += " <li data-shadeid='" + arrShadesFiltered[index].id + "'><a href='javascript:;' data-toggle='tooltip' data-placement='top' title='' data-original-title='" + arrShadesFiltered[index].shade_code + " " + arrShadesFiltered[index].shade_name + "'><span class='color-box3' style='background-color: rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ");'></span></a></li>";
            }
            shadesData += "</ul>";
        }
        catch (exception)
        {
            alert(arrShadesFiltered.length);
        }
        $("#dvLatestTrendShades").html(shadesData);
        $("#dvGoesWellWith").html("");
        $("#dvProducts").html("");
        if ($(window).width() > 1199) {

            $('.color-patches li .tooltip-show').tooltip('show');

            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                $('.color-patches li .tooltip-show').tooltip('show');
            });

            $('.color-patches li a').click(function () {
                $('.color-patches li .tooltip').removeClass('in')
                $(this).parent().children('.tooltip').addClass('in')
            });

            $('[data-toggle="tooltip"]').tooltip({
                placement: 'top'
            });

        }

        //display Similar Shades, Complimentary Shades, And Products for first time
        fnDisplayLatestTrendShadedInfoSimilarAndComplimentaryShades(arrShadesFiltered[0].id);
        fnAttachedFunctionToDisplayLatestTrendShadeInfo();

    }
    else {
        $("#dvLatestTrendShades").html(shadesData);
        $("#dvGoesWellWith").html("");
        $("#dvProducts").html("");

    }

}
function fnDisplayLatestTrendShadedInfoSimilarAndComplimentaryShades(shadeID) {
    var shadeInfo = "", complimentaryShades = "", similarShades = "";
    var sqlShades = "select * from arrShades where (id=='" + shadeID + "') ";
    var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
    if (arrShadesFiltered.length > 0) {
        for (var index = 0; index < arrShadesFiltered.length; index++) {
            var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
            shadeInfo += "<h4 class='mb-10 bold'>" + arrShadesFiltered[index].shade_name + "</h4>";
            shadeInfo += "<div class='shade mb-10' style='background-color: rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ");'>";
            shadeInfo += "<div class='like-icon  " + (IsExistInFavouriteCookie(arrShadesFiltered[index].id) ? "actv" : "") + "' data-shadeid='" + arrShadesFiltered[index].id + "'></div>";
            shadeInfo += "</div>";
            shadeInfo += "<p class='medm'>" + arrShadesFiltered[index].shade_code + " <br> " + arrShadesFiltered[index].shade_name + "</p>";
        }

        $("#dvLatestTrendShadeInfo").html(shadeInfo);

    }
    //make heart Selectable
    fnMakeHeartSelectable("dvLatestTrendShadeInfo");
    smilarComShadeCount = 0;
    ////    //call similar shades data function
    fnDisplaySimilarShades(shadeID);

    //    //call complimentary shades data function
    fnDisplayComplimentrayShades(shadeID);
    ////call function to display products based on selected shade
    fnDisplayProductsByShade(arrShadesFiltered.length, arrShadesFiltered[0].available_products);

}
function fnDisplayMetalicShadedInfoSimilarAndComplimentaryShades(shadeID) {
    var shadeInfo = "", complimentaryShades = "", similarShades = "";
    var sqlShades = "select * from arrShades where (id=='" + shadeID + "') ";
    var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
    if (arrShadesFiltered.length > 0) {
        for (var index = 0; index < arrShadesFiltered.length; index++) {
            var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
            shadeInfo += "<h4 class='mb-10 bold'>" + arrShadesFiltered[index].shade_name + "</h4>";
            shadeInfo += "<div class='shade mb-10' style='background-color: rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ");'>";
            shadeInfo += "<div class='like-icon  " + (IsExistInFavouriteCookie(arrShadesFiltered[index].id) ? "actv" : "") + "' data-shadeid='" + arrShadesFiltered[index].id + "'></div>";
            shadeInfo += "</div>";
            shadeInfo += "<p class='medm'>" + arrShadesFiltered[index].shade_code + " <br> " + arrShadesFiltered[index].shade_name + "</p>";
        }

        $("#dvmetalicShadeInfo").html(shadeInfo);

    }
    //make heart Selectable
    fnMakeHeartSelectable("dvmetalicShadeInfo");
    smilarComShadeCount = 0;
    ////    //call similar shades data function
    fnDisplaySimilarShades(shadeID);

    //    //call complimentary shades data function
    fnDisplayComplimentrayShades(shadeID);
    ////call function to display products based on selected shade
    fnDisplayProductsByShade(arrShadesFiltered.length, arrShadesFiltered[0].available_products);

}
function fnAttachedFunctionToDisplayMetalicShadeInfo() {
    $("#dvMetalicShades ul li").click(function () {
        $("#dvMetalicShades ul li").removeClass("active");
        $(this).addClass("active");
        fnDisplayMetalicShadedInfoSimilarAndComplimentaryShades($(this).data("shadeid"));
		if($(window).width()<480){
		$("html, body").animate({ scrollTop: $(this).parent('ul').parent('div').siblings('.shade-col').offset().top - $('.main-header').height() - 20});}
    });

}
function fnAttachedFunctionToDisplayLatestTrendShadeInfo() {
    $("#dvLatestTrendShades ul li").click(function () {
        $("#dvLatestTrendShades ul li").removeClass("active");
        $(this).addClass("active");
        fnDisplayLatestTrendShadedInfoSimilarAndComplimentaryShades($(this).data("shadeid"));
		if($(window).width()<480){
		$("html, body").animate({ scrollTop: $(this).parent('ul').parent('div').siblings('.shade-col').offset().top - $('.main-header').height() - 20});}
    });

}

function fnMakeTextureHeartSelectable(id) {
    //unbind all previous click bindings
    //  
    $("#"+id + " .like-icon").click(function () {
        if ($(this).attr("class").indexOf("actv") == -1) {
            // add in cookie
            var cookieValue = getCookie("FavTexture");
            var strNewCookieValue = "";
            if (cookieValue != null && cookieValue != "") {
                cookieValue += "," + $(this).data("textureid");
            }
            else {
                cookieValue = $(this).data("textureid");
            }
            SetCookie(cookieValue);
        }
        else {
            // remove from cookie
            RemoveValueFromCookie($(this).data("textureid"));
            //fnDisplayMySavedShadesData();
        }
        $(this).toggleClass('actv');

    });
}

function fnMakeHeartSelectable(id) {
    //unbind all previous click bindings
    //  
    $("#"+id + " .like-icon").click(function () {
        if ($(this).attr("class").indexOf("actv") == -1) {
            // add in cookie
            var cookieValue = getCookie("favourites");
            var strNewCookieValue = "";
            if (cookieValue != null && cookieValue != "") {
                cookieValue += "," + $(this).data("shadeid");
            }
            else {
                cookieValue = $(this).data("shadeid");
            }
            SetCookie(cookieValue);
        }
        else {
            // remove from cookie
            RemoveValueFromCookie($(this).data("shadeid"));
            fnDisplayMySavedShadesData();
        }
        $(this).toggleClass('actv');

    });
}

var sort_by = function (field, reverse, primer) {

    var key = primer ?
       function (x) { return primer(x[field]) } :
       function (x) { return x[field] };

    reverse = [-1, 1][+!!reverse];

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}

function fnDisplayShadesFamily() {
    var shadesFamilyData = "";
    var sqlShadeFamily = "select * from arrShadeFamily";
    var arrFilteredShadeFamily = jsonsql.query(sqlShadeFamily, arrShadeFamily);      
    if (arrFilteredShadeFamily.length > 0) {
        for (var index = 0; index < arrFilteredShadeFamily.length; index++) {
            shadesFamilyData += "<div class='slide-link color-item "+(index==0?" actv":"")+"' data-shadefamilyid='" + arrFilteredShadeFamily[index].id + "'>";
            shadesFamilyData += "<span class='color-box3' style='background-color: rgb(" + arrFilteredShadeFamily[index].shade_family_r + "," + arrFilteredShadeFamily[index].shade_family_g + "," + arrFilteredShadeFamily[index].shade_family_b + ");'></span>";
            shadesFamilyData += "<span class='arrw'>";
            shadesFamilyData += "<img src='images/arrow-bottom5.png' alt='Image'>";
            shadesFamilyData += "<span class='color-name'>" + arrFilteredShadeFamily[index].shade_family_name + "</span>";
            shadesFamilyData += "</span>";
            shadesFamilyData += "</div>";
        }
    }
   
    $("#dvShadeFamily").html(shadesFamilyData);
    fnAttachCarouselToShadeFamily();
    //Attach fucntion to display shades on family selection
    //fnAttachDisplayShadesByShadeFamilySelection();
    
    //Show Shades for first Time
    fnDisplayShadesData();
}

function fnAttachCarouselToShadeFamily() {
    if (typeof $('.color-carousel').data('owlCarousel') != 'undefined') {
        $('.color-carousel').data('owlCarousel').destroy();
        $('.color-carousel').removeClass('owl-carousel');
    }
   
    $(".color-carousel").owlCarousel({
        items: 16,
        itemsDesktop: [1199, 10],
        itemsDesktopSmall: [979, 8],
        itemsTablet: [768, 8],
        itemsMobile: [480, 3],
        pagination: false,
        mouseDrag: false,
        navigation: true,
        rewindNav:false
    });
    $('.color-patches li .color-box3').click(function () {
        var detectColor = $(this).css('backgroundColor');
        $('.shade').css({ 'background-color': detectColor, 'background-image': 'none' });
        $(this).addClass('actv');
        $(this).parent().siblings().find('.color-box3').removeClass('actv');
    });
    $('.color-item').click(function () {
        var detectColor2 = $(this).children('.color-box3').css('backgroundColor');
        $('.color-name').css('color', detectColor2);
        $(this).addClass('actv');
        $(this).parent().siblings().find('.color-item').removeClass('actv');
        fnDisplayShadesData();
    });
    $('.color-item').click(function () {
        $(this).addClass('actv');
        $(this).parent().siblings().find('.color-item').removeClass('actv');
    });
    var detectColor2First = $('.color-item.actv .color-box3').css('backgroundColor');
    $('.color-name').css('color', detectColor2First);
}

var availableShades = "";
function fnAttachDisplayShadesByShadeFamilySelection() {
    $("input[name=chkShadeFamily]").on("click", function () {
        availableShades = $("#dvMyShades ul").html();        
        $("#dvShadeInfo,#dvProducts,#dvComplimentaryShades,#dvSimilarShades").html("");
        fnDisplayShadesData();
    });

}

function fnDisplayShadesData() {
    var selectedShadeFamilies = "";
   
    $(".color-item.actv").each(function () {
        selectedShadeFamilies += " shade_family_id=='" + $(this).data("shadefamilyid") + "' || ";
    });
    
    if (selectedShadeFamilies!="")
        selectedShadeFamilies = selectedShadeFamilies.substring(0, selectedShadeFamilies.length - 3);
    if (selectedShadeFamilies != "")
        selectedShadeFamilies = " & (" + selectedShadeFamilies + ")";
    //if (selectedShadeFamilies != "") {
    var shadesData = "";
    var bucketData = "";
    var sqlShades = "select * from arrShades where (shade_category=='family'"+selectedShadeFamilies+")" 
       
        var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);        
        arrShadesFiltered = arrShadesFiltered.sort(sort_by("shadeorder", false, parseFloat));
        
        if (arrShadesFiltered.length > 0)
        {
            var bucket = 0;
            if ((arrShadesFiltered.length % 30) == 0) {
                bucket = arrShadesFiltered.length / 30;
                
            }
            else {
                bucket = parseInt(arrShadesFiltered.length / 30) + 1;
               
            }
           
            try{
                for (var indexOuter = 0; indexOuter < bucket; indexOuter++) {
                    var startIndex=indexOuter*30;
                    var lastIndex = (indexOuter + 1) * 30;
                    if (lastIndex >= arrShadesFiltered.length)
                        lastIndex = arrShadesFiltered.length;
                
                    bucketData += "<li " + (indexOuter == 0 ? " class='active'" : "") + ">";
                    bucketData+="<a data-toggle='tab' href='#shades-area"+(indexOuter+1)+"'>";
                    bucketData += "<span class='color-box4 actv' style='background-color: rgb(" + arrShadesFiltered[startIndex].shade_R + "," + arrShadesFiltered[startIndex].shade_G + "," + arrShadesFiltered[startIndex].shade_B + ");'></span>";
                    bucketData += "<span class='arrw'  " + (indexOuter == 0 ? "style='border-left-color: rgb(" + arrShadesFiltered[startIndex].shade_R + "," + arrShadesFiltered[startIndex].shade_G + "," + arrShadesFiltered[startIndex].shade_B + ");'" : "") + "></span>";
                    bucketData+="</a>";
                    bucketData += "</li>";
                
                    shadesData += "<ul id='shades-area" + (indexOuter + 1) + "' class='tab-pane "+(indexOuter==0?"active":"")+" color-patches clearfix'>";
                    for (var index = startIndex; index < lastIndex; index++) {
                        shadesData += " <li class='" + (index%30 == 0 ? "active" : "") + "' data-shadeid='" + arrShadesFiltered[index].id + "'><a href='javascript:;' data-toggle='tooltip' data-placement='top' title='" + arrShadesFiltered[index].shade_code + " " + arrShadesFiltered[index].shade_name + "'><span class='color-box3' style='background-color: rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ");'></span></a></li>";
                        //shadesData += "<div class='shadesBox' style='background:rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ")'></div>";
                        //shadesData += "<div class='shadesNameWrap'>" + arrShadesFiltered[index].shade_name + "<span>" + arrShadesFiltered[index].shade_code + "</span></div>";
                        //shadesData += "</li>";
                    }
                    shadesData += "</ul>";
                }
            }
            catch (exception) {
                alert(arrShadesFiltered.length+"##"+startIndex+"##"+bucket);
            }
        }
        $("#bucketSection").html("<ul class='sldr1 color-patch-sldr'>"+bucketData+"</ul>");

        $("#dvShades").html(shadesData);
        setTimeout(function () {
            if ($(window).width() < 768) {
                $('#bucketSection .sldr1.color-patch-sldr').bxSlider({
                    mode: 'horizontal',
                    minSlides: 2,
                    maxSlides: 2,
                    sliderWidth: 130,
                    sliderMargin: 0,
                    pager: false,
                    infiniteLoop: false,
                    hideControlOnEnd: true
                });
            }else{$('#bucketSection .sldr1.color-patch-sldr').bxSlider({
                    mode: 'vertical',
                    minSlides: 7,
                    maxSlides: 7,
                    sliderWidth: 130,
                    sliderMargin: 0,
                    pager: false,
                    infiniteLoop: false,
                    hideControlOnEnd: true
                });}
        }, 10)
        fnAttachSliderAndOtherFunctionToBucket();
        //display Similar Shades, Complimentary Shades, And Products for first time
        fnDisplayShadedInfoSimilarAndComplimentaryShades(arrShadesFiltered[0].id);
        fnAttachedFunctionToDisplayShadeInfo();
    //}
    //else {
      //  $("#dvShadesOnFamilyBasis ul").html("<li>Please select at-least one family to display shades!</li>");
        // make empty all the related fields with this shades
        //$("#dvShadeInfo,#dvProducts,#dvComplimentaryShades,#dvSimilarShades").html("");
    //}
}

function fnDisplayMySavedShadesData() {
    var cookieValue = getCookie("favourites");
    if (cookieValue != null)
    {
        var selectedShadeIds = "";
        var arrShadeIDs = cookieValue.split(",");
        for (var index = 0; index < arrShadeIDs.length; index++) {
            selectedShadeIds += " id=='" + arrShadeIDs[index] + "' || ";
        }

        if (selectedShadeIds != "")
            selectedShadeIds = selectedShadeIds.substring(0, selectedShadeIds.length - 3);
        var shadesData = "";
        var sqlShades = "select * from arrShades where (" + selectedShadeIds + ")";
        var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
        if (arrShadesFiltered.length > 0) {
            try {
                shadesData += "  <ul class='active-itm color-patches clearfix'>";
                for (var index = 0; index < arrShadesFiltered.length; index++) {
                    shadesData += " <li data-shadeid='" + arrShadesFiltered[index].id + "'><a href='javascript:;' data-toggle='tooltip' data-placement='top' title='" + arrShadesFiltered[index].shade_code + " " + arrShadesFiltered[index].shade_name + "'><span class='color-box3' style='background-color: rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ");'></span></a></li>";
                }
                shadesData += "</ul>";
            }
            catch (exception) {
                alert(arrShadesFiltered.length);
            }
            $("#dvMySavedShades").html(shadesData);
            fnAttachSliderAndOtherFunctionToBucket();
            //display Similar Shades, Complimentary Shades, And Products for first time
            fnDisplayMySavedShadedInfoSimilarAndComplimentaryShades(arrShadesFiltered[0].id);
            fnAttachedFunctionToDisplayMySavedShadeInfo();
        }
        else {
           // $("#dvGoesWellWith").html("");
           // $("#dvProducts").html("");
            
        }
    }

}

function fnDisplayMySavedShadedInfoSimilarAndComplimentaryShades(shadeID) {
    var shadeInfo = "", complimentaryShades = "", similarShades = "";
    var sqlShades = "select * from arrShades where (id=='" + shadeID + "') ";
    var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
    if (arrShadesFiltered.length > 0)
    {
        for (var index = 0; index < arrShadesFiltered.length; index++)
        {
            shadeInfo += "<h4 class='mb-10 bold'>" + arrShadesFiltered[index].shade_name + "</h4>";
            shadeInfo += "<div class='shade mb-10' style='background-color: rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ");'>";
            shadeInfo += "<div class='like-icon  " + (IsExistInFavouriteCookie(arrShadesFiltered[index].id) ? "actv" : "") + "' data-shadeid='" + arrShadesFiltered[index].id + "'></div>";
            shadeInfo += "</div>";
            shadeInfo += "<p class='medm'>" + arrShadesFiltered[index].shade_code + " <br> " + arrShadesFiltered[index].shade_name + "</p>";
        }

        $("#dvMySavedShadeInfo").html(shadeInfo);
    }    
    //make heart Selectable
    fnMakeHeartSelectable("dvMySavedShadeInfo");
    ////    //call similar shades data function
    smilarComShadeCount = 0;
    fnDisplaySimilarShades(shadeID);

    //    //call complimentary shades data function
    fnDisplayComplimentrayShades(shadeID);
   
    ////call function to display products based on selected shade
    fnDisplayProductsByShade(arrShadesFiltered.length, arrShadesFiltered[0].available_products);

}

function fnAttachSliderAndOtherFunctionToBucket() {

    var bgColor2 = $('#bucketSection .color-box4.actv').css('backgroundColor');
    $('#bucketSection li.active .arrw').css('border-left-color', bgColor2);

    $('#bucketSection li').click(function () {

        $('#bucketSection li').find('.arrw').css('border-left-color', '');
        var bgColor = $(this).find('.color-box4').css('backgroundColor');
        $(this).find('.arrw').css('border-left-color', bgColor);
		
		$('#bucketSection li').find('.color-box4').css('border', '1px solid #cacaca');
		$('#bucketSection li').find('.color-box4').css('border-bottom', 'none');
		$(this).find('.color-box4').css('border', '1px solid #000');
		$(this).find('.color-box4').css('border-bottom', '1px solid #000');
		
		$($(this).find("a").attr("href") + " li").eq(0).trigger("click");
    });
	$('#bucketSection li').eq(0).trigger("click");
setTimeout(function(){
	if ($(window).width() >= 768) {
	    //$('.sldr1').bxSlider({
	    //    mode: 'vertical',
	    //    minSlides: 7,
	    //    pager: false,
	    //    infiniteLoop: false,
	    //    hideControlOnEnd: true
	    //});
	    //$('.color-catgry-sldr').bxSlider({
	    //    mode: 'vertical',
	    //    minSlides: 3,
	    //    pager: false,
	    //    infiniteLoop: false,
	    //    hideControlOnEnd: true
	    //});
	}
	else {
	    //$('.sldr1').bxSlider({
	    //    mode: 'horizontal',
	    //    minSlides: 2,
	    //    pager: false,
	    //    infiniteLoop: false,
	    //    hideControlOnEnd: true
	    //});
	}
},10)

 var ani = $('.color-patch-col li.active a span').css('backgroundColor');
        $('.shade').css('backgroundColor', ani);
$('.tab-style1.main-tabs .nav li').on('shown.bs.tab', function () {
			 var id_name = $(this).children('a').attr('href');
            ani = $(id_name + '.color-patches li.active a span').css('backgroundColor'); 
            //$('.shade').css('backgroundColor', ani);
			
            if($(this).find("a").attr("href")=="#metalic-colors")
            {
                
                
            }
            else if ($(this).find("a").attr("href") == "#latest-trends") {
                $("#dvLatestTrends ul li").removeClass("active");
                $("#dvLatestTrends ul li").eq(0).addClass("active");
                //fnDisplayLatestTrendShadesData();                
            }
            else if ($(this).find("a").attr("href") == "#saved-shades") {
                fnDisplayMySavedShadesData();
				
            }
            else if ($(this).find("a").attr("href") == "#txtres-effects") {
				
                if ($("#txtres-effects ul li.active a").attr("href") == "#royl-play") {
                    //removed bcoz duplicacy of same function call which is already there in fnGetJSONDataByCategory()
                    //fnDisplayRoyalePlayTextureData();
					//alert('ok')
					
                }
				
            }

        });
 if ($(window).width() > 1199) {
            $('.color-patch-list').niceScroll({
                background: "#6d6e72",
                cursorcolor: "#333",
                cursorwidth: "5px",
                cursorborder: "0 none",
                autohidemode: false,
                cursorborderradius: "10px",
                horizrailenabled: false
            });

            $('.color-patches li .tooltip-show').tooltip('show');


            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                $('.color-patches li .tooltip-show').tooltip('show');
            });

            $('.color-patches li a').click(function () {
                $('.color-patches li .tooltip').removeClass('in')
                $(this).parent().children('.tooltip').addClass('in')
            });

            $('[data-toggle="tooltip"]').tooltip({
                placement: 'top'
            });
      
 }




}

function fnSearchShades() {
    var searchTerm = $("#inpSearch").val();
    if ($("#inpSearchInside").val() != "")
        searchTerm = $("#inpSearchInside").val();
    var searchWhereClause = "";
    if (searchTerm != "" && searchTerm != "Search")
      searchWhereClause="(shade_code.toLowerCase().indexOf('" + searchTerm + "')!=-1 || shade_name.toLowerCase().indexOf('" + searchTerm + "')!=-1)  ";
        var shadesData = "";
        //var sqlShades = "select * from arrShades where ("+selectedShadeFamilies + searchWhereClause+")";
        var sqlShades = "select * from arrShades where "  + searchWhereClause + "";
        var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
        arrShadesFiltered = arrShadesFiltered.sort(sort_by("shade_family_id", true, parseInt));
        if (arrShadesFiltered.length > 0)
        {
            shadesData += " <ul class='active-itm color-patches clearfix'>";
            for (var index = 0; index < arrShadesFiltered.length; index++) {
                shadesData += " <li data-shadeid='" + arrShadesFiltered[index].id + "'><a href='javascript:;' data-toggle='tooltip' data-placement='top' title='" + arrShadesFiltered[index].shade_code + " " + arrShadesFiltered[index].shade_name + "'><span class='color-box3' style='background-color: rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ");'></span></a></li>";
            }
            shadesData += "</ul>";
            $("#dvSearchShade").html(shadesData);
            //display Similar Shades, Complimentary Shades, And Products for first time
            fnDisplaySearchShadedInfoSimilarAndComplimentaryShades(arrShadesFiltered[0].id);
            fnAttachedFunctionToDisplaySearchShadeInfo();
        }
        else {
            $("#dvSearchShade").html("No shades found for this selection.");            
        }
        
    /*}
    else {
        $("#dvShadesOnFamilyBasis ul").html("<li>Please select at-least one family to display shades!</li>");
        // make empty all the related fields with this shades
        $("#dvShadeInfo,#dvProducts,#dvComplimentaryShades,#dvSimilarShades").html("");
    }*/
}

function fnReset() {
    $("#inpSearch").val("Search");
    $("input[name=chkShadeFamily][value='all']").attr("checked", "checked");
    fnDisplayShadesData();   
}

function fnAttachedFunctionToDisplaySearchShadeInfo() {
    $("#dvSearchShade ul li").click(function () {
        $("#dvSearchShade ul li").removeClass("active");
        $(this).addClass("active");
        fnDisplaySearchShadedInfoSimilarAndComplimentaryShades($(this).data("shadeid"));
		if($(window).width()<480){
		$("html, body").animate({ scrollTop: $(this).parent('ul').parent('div').siblings('.shade-col').offset().top - $('.main-header').height() - 20});}
    });

}

function fnAttachedFunctionToDisplayMySavedShadeInfo() {
    $("#dvMySavedShades ul li").click(function () {
        $("#dvMySavedShades ul li").removeClass("active");
        $(this).addClass("active");
        fnDisplayMySavedShadedInfoSimilarAndComplimentaryShades($(this).data("shadeid"));
		if($(window).width()<480){
		$("html, body").animate({ scrollTop: $(this).parent('ul').parent('div').siblings('.shade-col').offset().top - $('.main-header').height() - 20});}
    });

}

function fnAttachedFunctionToDisplayShadeInfo() {
    $("#dvShades ul li").click(function () {
        $("#dvShades ul li").removeClass("active");
        $(this).addClass("active");
        fnDisplayShadedInfoSimilarAndComplimentaryShades($(this).data("shadeid"));
		if($(window).width()<480){
		$("html, body").animate({ scrollTop: $(this).parent('ul').parent('div').siblings('.shade-col').offset().top - $('.main-header').height() - 20});}
    });
    
}

function fnDisplaySearchShadedInfoSimilarAndComplimentaryShades(shadeID) {
    var shadeInfo = "", complimentaryShades = "", similarShades = "";
    var sqlShades = "select * from arrShades where (id=='" + shadeID + "') ";
    var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
    if (arrShadesFiltered.length > 0) {
        for (var index = 0; index < arrShadesFiltered.length; index++) {
            var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
            shadeInfo += "<h4 class='mb-10 bold'>" + arrShadesFiltered[index].shade_name + "</h4>";
            shadeInfo += "<div class='shade mb-10' style='background-color: rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ");'>";
            shadeInfo += "<div class='like-icon  " + (IsExistInFavouriteCookie(arrShadesFiltered[index].id) ? "actv" : "") + "' data-shadeid='" + arrShadesFiltered[index].id + "'></div>";
            shadeInfo += "</div>";
            shadeInfo += "<p class='medm'>" + arrShadesFiltered[index].shade_code + " <br> " + arrShadesFiltered[index].shade_name + "</p>";
        }

        $("#dvSearchShadeInfo").html(shadeInfo);

    }
    //make heart Selectable
    fnMakeHeartSelectable("dvSearchShadeInfo");
    ////    //call similar shades data function

}

function fnDisplayShadedInfoSimilarAndComplimentaryShades(shadeID) {
    var shadeInfo = "", complimentaryShades = "", similarShades = "";
    var sqlShades = "select * from arrShades where (id=='" + shadeID + "') ";
    var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
    if (arrShadesFiltered.length > 0) {
        for (var index = 0; index < arrShadesFiltered.length; index++) {
            var arrShadesFiltered = jsonsql.query(sqlShades, arrShades);
            shadeInfo += "<h4 class='mb-10 bold'>" + arrShadesFiltered[index].shade_name + "</h4>";
            shadeInfo += "<div class='shade mb-10' style='background-color: rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ");'>";
            shadeInfo += "<div class='like-icon  " + (IsExistInFavouriteCookie(arrShadesFiltered[index].id) ? "actv" : "") + "' data-shadeid='" + arrShadesFiltered[index].id + "'></div>";
            shadeInfo += "</div>";
            shadeInfo += "<p class='medm'>" + arrShadesFiltered[index].shade_code + " <br> " + arrShadesFiltered[index].shade_name + "</p>";
        }
        $("#dvShadeInfo").html(shadeInfo);
       
        
}
    //make heart Selectable
    fnMakeHeartSelectable("dvShadeInfo");
    ////    //call similar shades data function
    fnDisplaySimilarShades(shadeID);    

    //    //call complimentary shades data function
    fnDisplayComplimentrayShades(shadeID);
    ////call function to display products based on selected shade
    fnDisplayProductsByShade(arrShadesFiltered.length, arrShadesFiltered[0].available_products);

}


function fnSetNiceScrollOnComplimentaryAndSimilarShadesData() {
    $(".visualizerWrapper .shadesMainWrap .right .box .shadesWrap .shadesHolder").each(function () {
        $(this).css({ "width": $(this).find("li").length * $(this).find("li").width() + "px" })
    });
    $(".dragSection").niceScroll({ touchbehavior: false, autohidemode: false, cursorborder: "", cursorcolor: "#e58f5a", cursorborderradius: "2px", cursorwidth: "6px", boxzoom: false, verticalenabled: false, background: "#f5ecdb" });
}

function fnDisplayComplimentrayShades(shadesID) {
    var complimentaryShadesData = "";
    var sqlShades = "select * from arrShades where (id=='" + shadesID + "') ";
    var arrSingleShadesFiltered = jsonsql.query(sqlShades, arrShades);
    var simpleShades = "";
    var relatedShades = "";
    var accentShades = "";
    var ceilingShades = "";
    if (arrSingleShadesFiltered.length > 0) {
        simpleShades = arrSingleShadesFiltered[0].simpleSuggestedShade;
        relatedShades = arrSingleShadesFiltered[0].relatedSuggestedShade;
        accentShades = arrSingleShadesFiltered[0].accentSuggestedShade;
        ceilingShades = arrSingleShadesFiltered[0].ceilingShades;
        var sqlAllShades = "select * from arrShades where ((shade_code=='" + simpleShades + "' || shade_code=='" + relatedShades + "' || shade_code=='" + accentShades + "')) ";
        var arrShadesFiltered = jsonsql.query(sqlAllShades, arrShades);
        if (arrShadesFiltered.length > 0) {
            complimentaryShadesData += "<h4>goes well with</h4>";
            complimentaryShadesData += "<div class='gallery-thumb-carousel center carousel-style1 owl-carousel mb-55' >";
            for (var index = 0; index < arrShadesFiltered.length; index++) {
                complimentaryShadesData += "<div class='item clearfix'>";
                complimentaryShadesData += "<div class='color-col'>";
                complimentaryShadesData += "<span class='main-color-box' style='background-color: rgb(" + arrSingleShadesFiltered[0].shade_R + "," + arrSingleShadesFiltered[0].shade_G + "," + arrSingleShadesFiltered[0].shade_B + ");'></span>";
                complimentaryShadesData += "</div>";
                complimentaryShadesData += "<div class='color-col'>";
                var sqlAllCeilingShades = "select * from arrShades where (shade_code=='" + ceilingShades + "') ";
                var arrCeilingShadessFiltered = jsonsql.query(sqlAllCeilingShades, arrShades);
                complimentaryShadesData += "<a href='javascript:;' data-toggle='tooltip' data-placement='top' title='" + arrCeilingShadessFiltered[0].shade_code + " " + arrCeilingShadessFiltered[0].shade_name + "'><span class='color-box3 mb-5' style='background-color: rgb(" + arrCeilingShadessFiltered[0].shade_R + "," + arrCeilingShadessFiltered[0].shade_G + "," + arrCeilingShadessFiltered[0].shade_B + ");'></span>";
                complimentaryShadesData += "<a href='javascript:;' data-toggle='tooltip' data-placement='top' title='" + arrShadesFiltered[index].shade_code + " " + arrShadesFiltered[index].shade_name + "'><span class='color-box3' style='background:rgb(" + arrShadesFiltered[index].shade_R + "," + arrShadesFiltered[index].shade_G + "," + arrShadesFiltered[index].shade_B + ")' ></span>";
                complimentaryShadesData += "</div>";
                complimentaryShadesData += "</div>";
            }
            complimentaryShadesData += "</div>";
        }
    }

    $("#dvGoesWellWith").html(complimentaryShadesData);
    fnAttachSliderToGoesWellWith();
}


    function fnDisplaySimilarShades(shadesID) {
    }

    function fnAttachSliderToGoesWellWith()
    {
        //set slider
        setTimeout(function () {
            if (typeof $('#dvGoesWellWith').data('owlCarousel') != 'undefined') {
                $('#dvGoesWellWith').data('owlCarousel').destroy();
                $('#dvGoesWellWith').removeClass('owl-carousel');
            }
            $("#dvGoesWellWith .gallery-thumb-carousel").owlCarousel({
                items: 3,
				    itemsTablet: [768,3],
    itemsMobile : [479,3],
                pagination: false,
                mouseDrag: false,
                navigation: true
            });
        }, 500);
    }

    function fnDisplayProductsByShade(shadesLength, availableShadeCodes) {
        var productsData = "";
        if (shadesLength > 0 && availableShadeCodes!="")
        {            
            var arrProductsByShadesFiltered = availableShadeCodes.split(",");
            if (arrProductsByShadesFiltered.length > 0)
            {
                productsData += "<h4>products in this colour</h4>";
                productsData += "<div class='gallery-thumb-carousel center carousel-style1 owl-carousel'>";
                
                var productIDsWhereClause = "where (";
                for (var index = 0; index < arrProductsByShadesFiltered.length; index++) {
                    if(arrProductsByShadesFiltered[index]!="")
                    productIDsWhereClause += "product_code=='" + arrProductsByShadesFiltered[index] + "' || ";
                }
                productIDsWhereClause = productIDsWhereClause.substring(0, productIDsWhereClause.length - 3);
                productIDsWhereClause += ")";
                var sqlProducts = "select * from arrProducts " + productIDsWhereClause;
                var arrFilteredProducts = jsonsql.query(sqlProducts, arrProducts);
                if (arrFilteredProducts.length > 0) {
                    for (var index = 0; index < arrFilteredProducts.length; index++) {
                        productsData += "<div>";
                        productsData += "<a href='javascript:;'><img src='resourcecontent/products/images/" + arrFilteredProducts[index].product_image + "' alt='Image'></a>";
                        productsData += "<h4>" + arrFilteredProducts[index].product_name + "</h4>";
                        productsData += "</div>";
                    }
                }
                productsData += "</div>";
                productsData += "</div>";
            }
        }
        
        $("#dvProducts").html(productsData);

        //call slick slider function for products
        fnAttachSliderToProducts();
    }

    function fnAttachSliderToProducts() {
        //set slider
        $("#dvProducts .gallery-thumb-carousel").owlCarousel({
            items: 3,
            pagination: false,
            mouseDrag: false,
            navigation: true
        });
}

    function clearjQueryCache() {
        for (var x in jQuery.cache) {
            delete jQuery.cache[x];
        }
    }
