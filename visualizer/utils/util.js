/*Utility class for project */
var Utils={
		
enable:function(option,clickHandler){
	if(option.hasClass('disabledStyle')){
		option.removeClass('disabledStyle');
		option.on('click',clickHandler);
	}
	
},
disable:function(option){
	if(!option.hasClass('disabledStyle')){
		option.addClass('disabledStyle');
		option.off('click');
	}
	
},
getRGBArray:function(data){
	var RGBArray=[];
	var temp=data.split(",");
	RGBArray[0]=parseInt(temp[0].substring(4));//R
	RGBArray[1]=parseInt(temp[1]);//G
	RGBArray[2]=parseInt(temp[2].substring(0,temp[2].length-1));//B
	
	return RGBArray;
	},
	convertToRGBArray:function(r,g,b){
		var RGBArray=[];
		RGBArray[0]=parseInt(r);//R
		RGBArray[1]=parseInt(g);//G
		RGBArray[2]=parseInt(b);//B
		
		return RGBArray;
	},	
getBase64EncodedData:function(data){
	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	ac = 0,
	enc = "",
	tmp_arr = [];
		
	if (!data) {
		return data;
	  }
		 
	do { // pack three octets into four hexets
			o1 = data.charCodeAt(i++);
			o2 = data.charCodeAt(i++);
			o3 = data.charCodeAt(i++);
			
			bits = o1 << 16 | o2 << 8 | o3;
			
			h1 = bits >> 18 & 0x3f;
			h2 = bits >> 12 & 0x3f;
			h3 = bits >> 6 & 0x3f;
			h4 = bits & 0x3f;
		
			// use hexets to index into b64, and append result to encoded string
			tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
		  } while (i < data.length);
		
	enc = tmp_arr.join('');
	var r = data.length % 3;
		
	var encodedData = (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
	return 'data:image/png;base64,'+encodedData;
	},	
addCanvasClick:function(){
	$('#glcanvas').on('click',this.setCanvasEventCoordinates);	
   	 	
	},
addCanvasMove:function(){
	$('#glcanvas').on('mousemove',this.setCanvasEventCoordinates);	
},	
removeCanvasClick:function(){
	$('#glcanvas').off('click');
},
removeCanvasMove:function(){
	$('#glcanvas').off('mousemove');
	},

setCanvasEventCoordinates:function(event)
	{
		var touchX = event.offsetX;
        var touchY = event.offsetY;
        console.log("X="+touchX +" Y="+touchY);
	},
	showLoader : function(){
		$(".loader").show();
	},
	
	hideLoader : function(){
		$(".loader").hide();
	},
	
	showOverlay : function(){
		$(".popupOverlay").show();
	}, 
	
	hideOverlay : function(){
		$(".popupOverlay").hide();
	},
	getMatchingObject:function(arrayObj,string){
		var name;
		for(var x=0;x<arrayObj.length;x++){
			name=arrayObj[x].name.split('/').pop();
			if(name==string){
				return arrayObj[x];
			}
		}
		
	}
};


// attach the .compare method to Array's prototype to call it on any array
Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}