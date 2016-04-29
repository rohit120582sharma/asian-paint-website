/*
var inspirationWallURL="http://www.asianpaints.com/webservices/Handlersmobile/InspirationWallHandler.ashx?";
var colorSpectraURL="http://visualizer.asianpaints.com/VS/color_spectra?appid=A2&format=gzip";
var wallFashionURL="http://visualizer.asianpaints.com/VS/wallfashion?appid=A2&format=gzip";
var effectsURL="http://visualizer.asianpaints.com/VS/texture_combination_web?appid=A2&format=gzip";
var filterURL="http://www.asianpaints.com/webservices/handlersmobile/InspirationWallHandler.ashx?Section=InspirationFilterNested";

var inspirationWallURL = "http://iabeta.in/ap-home/visualizer/modules/webservice/inspiration.json";
var colorSpectraURL = "http://iabeta.in/ap-home/visualizer/modules/webservice/colour-spectra.json";
var wallFashionURL = "http://iabeta.in/ap-home/visualizer/modules/webservice/wall-fashion.json";
var effectsURL = "http://iabeta.in/ap-home/visualizer/modules/webservice/texture-visualiser-json.json";
var filterURL = "http://iabeta.in/ap-home/visualizer/modules/webservice/inspiration-filter.json";
*/

var inspirationWallURL = "http://www.asianpaints.com/webservices/Handlersmobile/InspirationWallHandler.ashx?";
var colorSpectraURL = "http://visualizer.asianpaints.com/VS/color_spectra?appid=A2&format=gzip";
var wallFashionURL = "http://visualizer.asianpaints.com/VS/wallfashion?appid=A2&format=gzip";
var effectsURL = "http://visualizer.asianpaints.com/VS/texture_combination_web?appid=A2&format=gzip";
var filterURL = "http://www.asianpaints.com/webservices/handlersmobile/InspirationWallHandler.ashx?Section=InspirationFilterNested";

var Webservice={getInspirationWallData:function(galleryOption,filterOption,success,error){var url=inspirationWallURL+"Section=InspirationWallItems&ParamData=ShowInspirationItemsByAdmin&SortByParam=&CurrentCount=0";if(galleryOption==inspirationWall.MYWALL){}else if(galleryOption==inspirationWall.GALLERY){url+="&InspWallType=AP";}
if(filterOption.filterOption==inspirationWall.INTERIOR){url+="&MainType_Id=1";}else if(filterOption.filterOption==inspirationWall.EXTERIOR){url+="&MainType_Id=2";}
if(filterOption.filterUri)url+="&"+filterOption.filterUri;this.getRequest('GET',url,success,error);},getColorSpectraData:function(success,error){this.getRequestWithAutenticationHeaders('GET',colorSpectraURL,success,error);},getCorrectData:function(success,error){this.getRequestWithAutenticationHeaders('GET',"http://mobileapp.asianpaints.com/Visualizer/wallfashion?appid=A2",success,error);},getWallFashionData:function(success,error){this.getRequestWithAutenticationHeaders('GET',wallFashionURL,success,error);},getEffectsData:function(success,error){this.getRequestWithAutenticationHeaders('GET',effectsURL,success,error);},getRequest:function(requestType,URL,successHandler,errorHandler)
{$.ajax({type:requestType,url:URL,timeout:1000,success:successHandler,error:errorHandler});},getRequestWithAutenticationHeaders:function(requestType,URL,successHandler,errorHandler)
{$.ajax({type:requestType,url:URL,timeout:20000,success:successHandler,error:errorHandler});},make_base_auth:function make_base_auth(user,password){var tok=user+':'+password;var hash=btoa(tok);return'Basic '+hash;}};