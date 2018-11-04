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
    file = decodeURIComponent(getURLParameter('file')).toLowerCase();

    if (dir != "undefined" && $("#" + dir).length > 0) {
        $("#" + dir).show();
        $(this).scrollTop(0);
        if (file == "undefined") {
            await show_listing();
        } else {
            console.log("displaying file!");
            await show_listing(0);
        }
        
    } else if (file == "undefined") {
        //if dir is invalid and file doesn't exist
        $("#home").show();
        $(this).scrollTop(0);
        //type in ls and execute it
        await sleep(2000);
        await valTypeWriter("terminal", "ls", 300);
        system($("#terminal").val());
    }

    if (file != "undefined" && $("#" + dir + "-" + file).length > 0) {
        clear_output();
        element = $("#" + dir + "-" + file);
        html = element.html();
        document.getElementById("output").innerHTML += html;
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
async function typeWriter(elementId, text, wrapperClass=null, delay=10) {
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
        //clear it
        system($("#terminal").val());
        $("#terminal").val("");
    }
});

function create_handlers() { //refractor this
    //clear all previous handlers then create again
    $(".cmdtrigger").off();

    $("a.cmdtrigger").click(async function(e) {
        e.preventDefault();
        // console.log("command: " + $(e.target).attr("cmd"));
        $("#terminal").val(''); //clear terminal input
        console.log(e.target);
        await valTypeWriter("terminal", $(e.target).attr("cmd"), 50);
        system($("#terminal").val());
    });
}

function get_counter() {
    window.counter++;
    return window.counter;
}

async function show_listing(delay=300) {
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
        if (delay != 300) {
            await typeWriter(parentId, description, "description", 0);
        } else {
            await typeWriter(parentId, description, "description");
        }
        console.log("test");
        await sleep(delay);
        
    }
    create_handlers(); //refresh handlers list
}

