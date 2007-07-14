/* -*- mode: javascript; c-basic-offset: 4; indent-tabs-mode: t; -*- */

var pickerLayer = $("#pickerLayer")[0];

var pickerWidth = 600;
var pickerItemWidth = 150;
var pickerItemPadding = 20;

function renderBeauty ()
{
    var canvas = $("#pickerWindowBeauty")[0];
    canvas.width = pickerWidth;
    canvas.height = 200;
    var ctx = canvas.getContext('2d');

    var gradient = ctx.createRadialGradient (canvas.width / 2, canvas.height / 2,
					     0,
					     canvas.width / 2, canvas.height / 2, canvas.width / 2);

    gradient.addColorStop (0.0, 'rgba(0, 0, 0, 0.0)');
    gradient.addColorStop (0.4, 'rgba(115, 155, 155, 0.4)');
    gradient.addColorStop (0.7, 'rgba(180, 180, 180, 0.7)');
    gradient.addColorStop (0.8, 'rgba(200, 200, 200, 0.8)');
    gradient.addColorStop (1.0, 'rgba(255, 255, 255, 1.0)');

    ctx.fillStyle = gradient;

    ctx.fillRect (0, 0,
		  canvas.width, canvas.height);
}


function newWindow (w)
{
    var item = $("#pickerItem").clone()[0];

    item.original_window = w;

    item._contents = $("#window", item)[0];
    item._label = $("#label", item)[0];
    
    item._native = CompzillaWindowContent (w.content.nativeWindow);
    item._contents.appendChild (item._native);

    item._label.innerHTML = w.content.wmName;

    item.style.display = "block";

    _addUtilMethods (item);

    return item;
}

function addWindow (el)
{
    $("#pickerContents")[0].appendChild (newWindow (el));
}

function populatePicker (forward)
{
    renderBeauty ();

    for (var el = windowStack.firstChild; el != null; el = el.nextSibling) {
	if (el.className == "uiDlg" /* it's a compzillaWindowFrame */
	    && el.content.nativeWindow /* it has native content */
	    && el.style.display == "block" /* it's displayed */) {
	    addWindow (el);
	}
    }

    var vs = $(".pickerItem", $("#pickerContents"));

    if (vs.length == 0) 
	return;

     var win_x;
     if (forward) {
 	/* if we're moving foward, center the first window. */
 	win_x = vs[0].offsetLeft;
 	Debug (" x[0] = " + win_x);
 	for (var i = 1; i < vs.length; i ++) {
 	    win_x += pickerItemWidth + pickerItemPadding;
 	    var v = vs[i];
 	    v.style.left = win_x + "px";
 	    Debug (" x["+i+"] = " + win_x);
 	}
     }
     else {
 	/* if we're moving backward, center the last window. */
 	win_x = vs[vs.length - 1].offsetLeft;
 	for (var i = vs.length - 2; i >= 0; i --) {
 	    win_x -= pickerItemWidth + pickerItemPadding;	
 	    var v = vs[i];
 	    v.style.left = win_x + "px";
 	}
     }
}

function clearPicker ()
{
    // this doesn't work?  $("#pickerWindow").remove(".pickerItem");

    var vs = $(".pickerItem", $("#pickerContents"));
    for (i = 0; i < vs.length; i ++) {
	var v = vs[i];
	$("#pickerContents")[0].removeChild (v);
    }
}

var shown = false;

function showPicker (forward)
{
    if (!shown) {
      	populatePicker (forward);

	var contents = $("#pickerContents")[0];
	var vs = $(".pickerItem", $("#pickerContents"));

	_addUtilMethods (contents);

  	pickerLayer.style.display = "block";

	document.addEventListener("keyup", {
	                              handleEvent: function (event) {
					  if (event.keyCode == event.DOM_VK_CONTROL) {
					      pickerLayer.style.display = "none";
					      shown = false;

					      vs[selected_window].original_window.doFocus();

					      clearPicker ();

					      document.removeEventListener ("keyup", this, true);
					  }
				      }
				  },
				  true);

	shown = true;


        if (forward) {
	    selected_window = 0;
        }
        else {
	    selected_window = vs.length - 1;
        }

	$(vs[selected_window]).addClass ("selectedPickerItem");

 	var contentPos = contents.getPosition ();

 	var delta_to_center = (screen.width / 2) - contentPos.left - (vs[selected_window].offsetLeft + vs[selected_window].offsetWidth / 2);

	Debug ("contents.left = " + contentPos.left + ", and a delta of " + delta_to_center  + " is needed to get item " + selected_window + " centered");
 	contents.style.left = (contents.offsetLeft + delta_to_center) + "px";
    }

    var vs = $(".pickerItem", $("#pickerContents"));
    if (vs.length <= 1) {
	return;
    }

    if (forward) {
	nextWindow ();
    }
    else {
	prevWindow ();
    }
}

var selected_window;

function nextWindow ()
{
    var vs = $(".pickerItem", $("#pickerContents"));
    var v = $("#pickerContents")[0];

    if (selected_window == vs.length - 1)
	return;

    var delta = vs[selected_window].offsetLeft - vs[selected_window + 1].offsetLeft;

    $(vs[selected_window]).toggleClass ("selectedPickerItem");

    selected_window ++;

    $(vs[selected_window]).toggleClass ("selectedPickerItem");

    $(v).animate ({left: v.offsetLeft + delta }, 250, "linear");
}

function prevWindow ()
{
    var vs = $(".pickerItem", $("#pickerContents"));
    var v = $("#pickerContents")[0];

    if (selected_window == 0)
	return;

    var delta = vs[selected_window].offsetLeft - vs[selected_window - 1].offsetLeft;

    $(vs[selected_window]).toggleClass ("selectedPickerItem");

    selected_window --;

    $(vs[selected_window]).toggleClass ("selectedPickerItem");

    $(v).animate ({left: v.offsetLeft + delta }, 250, "linear");
}
