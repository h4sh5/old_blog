var counter = 0;

$(document).ready(async function() {

    console.log('ready');
    $("#terminal").focus();

    $.getScript('js/command.js', function() {
        console.log("Commands loaded.");
    });

    $("article").hide();
    //hide all articles and show only the beginning, unless there's some page specified in the GET param
    dir = decodeURIComponent(getURLParameter('dir')).toLowerCase();

    if (dir != "undefined" && $("#" + dir).length > 0) {
        $("#" + dir).show();
        $(this).scrollTop(0);
        await show_listing();
    } else {
        $("#home").show();
        $(this).scrollTop(0);
    }


    //disable no javascript note
    $("aside").toggleClass('nojs');

    create_handlers();

    // //use decodeURLComponent to handle spaces
    


});




//taken from https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep#39914235
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// this function is from http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function getURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {

            return sParameterName[1];

        }
    }
}

//wrap a string in single quote and returns it
function sQuote(string) {
    return "'" + string+ "'";
}

async function valTypeWriter(elementId, text, speed) {
    for (i = 0; i < text.length; i++) {
        output = $("#" + elementId).val();
        output += text.charAt(i);
        $("#" + elementId).val(output);
        await sleep(speed);
    }
    return 0;
}

/* type some text to selected element */
async function typeWriter(elementId, text, wrapperClass=null) {
    var delay = 30;
    // console.log(speed);
    if (wrapperClass != null) { 
        //if a wrapper class is defined, create a new span with that class
        //and sets an unique, consecutive id to it via the gloabl counter
        counter = get_counter();
        document.getElementById(elementId).innerHTML += "<span class='" + wrapperClass + "' id='" + counter.toString() + "'>";
        elementId = counter.toString();
    }
    for (i = 0; i < text.length; i++) {
        // $(elementSelect).append(text.charAt(i));
        document.getElementById(elementId).innerHTML += text.charAt(i);
        await sleep(delay);
    }
    $("#" + elementId).append("<br>");
    return 0;
}


$("#terminal").on("keypress", function(e) {
    console.log("keyCode:", e.keyCode);
    console.log("char:", String.fromCharCode(e.charCode));
    //catch enter key
    if (e.keyCode == 13) {
        //TODO: change to execute
        // window.location = "?cmd=" + $("#terminal").val();
        system($("#terminal").val());
    }
});

function create_handlers() { //refractor this
    //clear all previous handlers then create again
    $(".cmdtrigger").off();

    $(".cmdtrigger").click(async function(e) {
        e.preventDefault();
        // console.log("command: " + $(e.target).attr("cmd"));
        $("#terminal").val(''); //clear terminal input
        console.log(e.target);
        await valTypeWriter("terminal", $(e.target).attr("cmd"), 80);
        system($("#terminal").val());
    });
}

function get_counter() {
    window.counter++;
    return window.counter;
}

async function show_listing() {
    //first hide all sections
    $("section").hide();
    $(".cmdtrigger").hide();
    $(".cmdtrigger").parent().hide();
    //get current directory
    dir = getURLParameter("dir").toLowerCase();
    await typeWriter(dir + "-nav", "directory listing:");
    await typeWriter(dir + "-nav", "--------------------------");

    elements = $("#" + dir + " .cmdtrigger");
    // console.log("#" + dir + " .cmdtrigger");
    console.log(elements.length);
    for (var i = 0; i < elements.length; i++) {
        element = elements[i];
        element.id = get_counter(); //counter must increment each time it is used
        var parentId = get_counter();

        $("#" + element.id).parent().attr("id", parentId);
        $("#" + parentId).show();
        $("#" + element.id).show();
        // console.log($("#" + element.id), $("#" + element.id).parent());
        var length = $('<div>').html($("#" + element.id + " h2").html()).text().length;
        document.getElementById(element.id).parentNode.innerHTML += "&nbsp;".repeat(spaces - length);
        console.log(element.id, element);
        description = $("#" + element.id).attr("desc");
        await typeWriter(parentId, description, "description");
        console.log("test");
        await sleep(200);
        
    }
    create_handlers(); //refresh handlers list
}

