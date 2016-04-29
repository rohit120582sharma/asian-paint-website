// augment Sylvester some
Matrix.Translation = function (v)
{
  if (v.elements.length == 2) {
    var r = Matrix.I(3);
    r.elements[2][0] = v.elements[0];
    r.elements[2][1] = v.elements[1];
    return r;
  }

  if (v.elements.length == 3) {
    var r = Matrix.I(4);
    r.elements[0][3] = v.elements[0];
    r.elements[1][3] = v.elements[1];
    r.elements[2][3] = v.elements[2];
    return r;
  }

  throw "Invalid length for Translation";
}

Matrix.prototype.flatten = function ()
{
    var result = [];
    if (this.elements.length == 0)
        return [];


    for (var j = 0; j < this.elements[0].length; j++)
        for (var i = 0; i < this.elements.length; i++)
            result.push(this.elements[i][j]);
    return result;
}

Matrix.prototype.ensure4x4 = function()
{
    if (this.elements.length == 4 &&
        this.elements[0].length == 4)
        return this;

    if (this.elements.length > 4 ||
        this.elements[0].length > 4)
        return null;

    for (var i = 0; i < this.elements.length; i++) {
        for (var j = this.elements[i].length; j < 4; j++) {
            if (i == j)
                this.elements[i].push(1);
            else
                this.elements[i].push(0);
        }
    }

    for (var i = this.elements.length; i < 4; i++) {
        if (i == 0)
            this.elements.push([1, 0, 0, 0]);
        else if (i == 1)
            this.elements.push([0, 1, 0, 0]);
        else if (i == 2)
            this.elements.push([0, 0, 1, 0]);
        else if (i == 3)
            this.elements.push([0, 0, 0, 1]);
    }

    return this;
};

Matrix.prototype.make3x3 = function()
{
    if (this.elements.length != 4 ||
        this.elements[0].length != 4)
        return null;

    return Matrix.create([[this.elements[0][0], this.elements[0][1], this.elements[0][2]],
                          [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
                          [this.elements[2][0], this.elements[2][1], this.elements[2][2]]]);
};

Vector.prototype.flatten = function ()
{
    return this.elements;
};

function mht(m) {
    var s = "";
    if (m.length == 16) {
        for (var i = 0; i < 4; i++) {
            s += "<span style='font-family: monospace'>[" + m[i*4+0].toFixed(4) + "," + m[i*4+1].toFixed(4) + "," + m[i*4+2].toFixed(4) + "," + m[i*4+3].toFixed(4) + "]</span><br>";
        }
    } else if (m.length == 9) {
        for (var i = 0; i < 3; i++) {
            s += "<span style='font-family: monospace'>[" + m[i*3+0].toFixed(4) + "," + m[i*3+1].toFixed(4) + "," + m[i*3+2].toFixed(4) + "]</font><br>";
        }
    } else {
        return m.toString();
    }
    return s;
}

//
// gluLookAt
//
function makeLookAt(ex, ey, ez,
                    cx, cy, cz,
                    ux, uy, uz)
{
    var eye = $V([ex, ey, ez]);
    var center = $V([cx, cy, cz]);
    var up = $V([ux, uy, uz]);

    var mag;

    var z = eye.subtract(center).toUnitVector();
    var x = up.cross(z).toUnitVector();
    var y = z.cross(x).toUnitVector();

    var m = $M([[x.e(1), x.e(2), x.e(3), 0],
                [y.e(1), y.e(2), y.e(3), 0],
                [z.e(1), z.e(2), z.e(3), 0],
                [0, 0, 0, 1]]);

    var t = $M([[1, 0, 0, -ex],
                [0, 1, 0, -ey],
                [0, 0, 1, -ez],
                [0, 0, 0, 1]]);
    return m.x(t);
}

//
// glOrtho
//
function makeOrtho(left, right,
                   bottom, top,
                   znear, zfar)
{
    var tx = -(right+left)/(right-left);
    var ty = -(top+bottom)/(top-bottom);
    var tz = -(zfar+znear)/(zfar-znear);

    return $M([[2/(right-left), 0, 0, tx],
               [0, 2/(top-bottom), 0, ty],
               [0, 0, -2/(zfar-znear), tz],
               [0, 0, 0, 1]]);
}

//
// gluPerspective
//
function makePerspective(fovy, aspect, znear, zfar)
{
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
}

//
// glFrustum
//
function makeFrustum(left, right,
                     bottom, top,
                     znear, zfar)
{
    var X = 2*znear/(right-left);
    var Y = 2*znear/(top-bottom);
    var A = (right+left)/(right-left);
    var B = (top+bottom)/(top-bottom);
    var C = -(zfar+znear)/(zfar-znear);
    var D = -2*zfar*znear/(zfar-znear);

    return $M([[X, 0, A, 0],
               [0, Y, B, 0],
               [0, 0, C, D],
               [0, 0, -1, 0]]);
}

//
// glOrtho
//
function makeOrtho(left, right, bottom, top, znear, zfar)
{
    var tx = - (right + left) / (right - left);
    var ty = - (top + bottom) / (top - bottom);
    var tz = - (zfar + znear) / (zfar - znear);

    return $M([[2 / (right - left), 0, 0, tx],
           [0, 2 / (top - bottom), 0, ty],
           [0, 0, -2 / (zfar - znear), tz],
           [0, 0, 0, 1]]);
}

//------------------------------------------------------------------
//----------------------***Matrix Calculation***--------------------
//------------------------------------------------------------------

//----------------------------------------------------
//Function Returns a Translation - Matrix of order '3'
//Parameter: Translate-Vector (2D Array)
//----------------------------------------------------
function trans_matrix_3(trans_vec)
{
	var trans_Mat = new Array(3);
	
	trans_Mat[0]	= new Array(3);
	trans_Mat[1]	= new Array(3);
	trans_Mat[2]	= new Array(3);
	
	trans_Mat[0][0]	= 1;
	trans_Mat[0][1]	= 0;
	trans_Mat[0][2]	= 0;
					
	
	trans_Mat[1][0]	= 0;
	trans_Mat[1][1]	= 1;
	trans_Mat[1][2]	= 0;
		
	
	trans_Mat[2][0]	= trans_vec[0];				// X coord of translation vector
	trans_Mat[2][1]	= trans_vec[1];				// Y coord of translation vector
	trans_Mat[2][2]	= 1;

	return trans_Mat;
}

//----------------------------------------------------
//Function Returns a Scale - Matrix of order '3'
//Parameter: Scale-Vector (2D Array)
//----------------------------------------------------
function scale_matrix_3(scale_vect)
{
	var scale_Mat = new Array(3);
	
	scale_Mat[0]	= new Array(3);
	scale_Mat[1]	= new Array(3);
	scale_Mat[2]	= new Array(3);
		
	scale_Mat[0][0]	= scale_vect[0];					// X coord of Scale Vector
	scale_Mat[0][1]	= 0;
	scale_Mat[0][2]	= 0;
	
	scale_Mat[1][0]	= 0;
	scale_Mat[1][1]	= scale_vect[1];					// Y coord of Scale Vector
	scale_Mat[1][2]	= 0;
					
	
	scale_Mat[2][0]	= 0;
	scale_Mat[2][1]	= 0;
	scale_Mat[2][2]	= 1;								
		
	return scale_Mat;
}

//----------------------------------------------------
//Function Returns a Translation - Matrix of order '3'
//Anti-Clock wise Rotational Matrix 
//Parameter: Float (Angle in terms of Radian)
//----------------------------------------------------
function rotate_matrix_3_Z(rot_theta)
{
	var rot_Mat = new Array(3);
	
	rot_Mat[0]	= new Array(3);
	rot_Mat[1]	= new Array(3);
	rot_Mat[2]	= new Array(3);
	
	rot_Mat[0][0]	= Math.cos(rot_theta);
	rot_Mat[0][1]	= Math.sin(rot_theta) * -1;
	rot_Mat[0][2]	= 0;
	
	rot_Mat[1][0]	= Math.sin(rot_theta);
	rot_Mat[1][1]	= Math.cos(rot_theta);
	rot_Mat[1][2]	= 0;
	
	rot_Mat[2][0]	= 0;
	rot_Mat[2][1]	= 0;
	rot_Mat[2][2]	= 1;
		
	return rot_Mat;
}

//----------------------------------------------------
//Function Returns the resultant - matrix after  
//multiplying two matrices of order '3'
//Parameter: 2 matrices of order 3 (2D Array)
//----------------------------------------------------
function mult_matrix_3_2D(temp_mat_1, temp_mat_2)
{
	var res_Mat = new Array(3);
	
	res_Mat[0] = new Array(3);
	res_Mat[1] = new Array(3);
	res_Mat[2] = new Array(3);
	
	for (i_count = 0; i_count < 3; ++i_count)
		for (j_count = 0; j_count < 3; ++j_count)
			res_Mat[i_count][j_count] = 0;
	
	for (i_count = 0; i_count < 3; ++i_count)
		for (j_count = 0; j_count < 3; ++j_count)
		{
			for (k_count = 0; k_count < 3; ++k_count)
				res_Mat[i_count][j_count] += temp_mat_1[i_count][k_count] * temp_mat_2[k_count][j_count];
		}
		
	return res_Mat;
}

//-----------------------------------------------------------------------
//Function Returns the resultant - matrix in 1-Dimension
//Parameter: matrix of 2-dimension
//-----------------------------------------------------------------------
function mat3_2D_to_1D(matrix3_2D)
{
	//var matrix3_1D = new Array(9);
	var matrix3_1D = new Float32Array(Matrix.I(3).flatten());
	
	var k_count = 0;
	for (i_count = 0; i_count < 3; ++i_count)
		for (j_count = 0; j_count < 3; ++j_count)
			matrix3_1D[k_count++] = matrix3_2D[i_count][j_count];
	
	return matrix3_1D;
}

//-----------------------------------------------------------------------
//Function Returns the resultant - matrix after multiplying
// two matrices dimension-'2' and dimension-'1'
//Parameter: 2 matrices of dimension-'2' and dimension-'1' respectively
//-----------------------------------------------------------------------
function mult_matrix_3(rot_Mat, mv_Mat)
{
	var result_Mat = new Array(16);
	
	for (i_count = 0; i_count < 16; ++i_count)
		result_Mat[i_count]	=	0;
		
	var loc_rot_Mat = new Array(4);
	loc_rot_Mat[0] = new Array(4);
	loc_rot_Mat[1] = new Array(4);
	loc_rot_Mat[2] = new Array(4);
	loc_rot_Mat[3] = new Array(4);
	
	var k_count = 0;
	for (i_count = 0; i_count < 4; ++i_count)
		for (j_count = 0; j_count < 4; ++j_count)
		{
			if((i_count < 3) && (j_count < 3))
				loc_rot_Mat[i_count][j_count] = rot_Mat[i_count][j_count];
			else
				loc_rot_Mat[i_count][j_count] = 0;
		}
	loc_rot_Mat[3][3] = 1;
		
	var loc_mv_Mat = new Array(4);
	loc_mv_Mat[0] = new Array(4);
	loc_mv_Mat[1] = new Array(4);
	loc_mv_Mat[2] = new Array(4);
	loc_mv_Mat[3] = new Array(4);
	
	var k_count = 0;
	for (i_count = 0; i_count < 4; ++i_count)
		for (j_count = 0; j_count < 4; ++j_count)
		{
			loc_mv_Mat[i_count][j_count] = mv_Mat[k_count++];
		}
	
	var res_Mat = new Array(4);
	res_Mat[0] = new Array(4);
	res_Mat[1] = new Array(4);
	res_Mat[2] = new Array(4);
	res_Mat[3] = new Array(4);
	
	for (i_count = 0; i_count < 4; ++i_count)
		for (j_count = 0; j_count < 4; ++j_count)
			res_Mat[i_count][j_count] = 0;
	
	for (i_count = 0; i_count < 4; ++i_count)
		for (j_count = 0; j_count < 4; ++j_count)
		{
			for (k_count = 0; k_count < 4; ++k_count)
				res_Mat[i_count][j_count] += loc_mv_Mat[i_count][k_count] * loc_rot_Mat[k_count][j_count];
		}
		
	k_count = 0;
	for (i_count = 0; i_count < 4; ++i_count)
		for (j_count = 0; j_count < 4; ++j_count)
		{
			result_Mat[k_count++] = res_Mat[i_count][j_count];
		}
	
	return result_Mat;
}