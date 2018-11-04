//this file only works when included into script.js

//a function that adds a repeat method to a the string class in javascript
//https://stackoverflow.com/questions/202605/repeat-string-javascript
String.prototype.repeat = function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
};

//associating entry names with the command to access them
var entries = {"home":"cd", "inkedout":"cd", "dotmatrix":"cd", "oscp":"cd"};
var descriptions = {
    "home": "There's no place like 127.0.0.1",
    "inkedout": "Hacky bits and pieces from an interactive design project",
    "dotmatrix": "How I managed to stack together an electronic scoreboard",
    "oscp": "My journey to becoming an Offensive Security Certified Professional",
};

spaces = 20; //amount of '&nbsp;'s in total, for spacing purposes

function clear_output() {
    $("#output").html("");
}

function create_command(cmd) {
    html = "<a href='.' class='cmdtrigger' cmd=" + sQuote(cmd) + ">"
    + cmd + "</a>";
    console.log("creating command button: " + html);
    return html;
}

/* creates an <a> tag associated with a name and an type. The type is used
for which command to use to access it */
function create_file_entry(name, type) {
    html = "<a href='.' class='cmdtrigger' cmd=" + sQuote(type + " " + name) +
    ">" + name + "</a>";
    console.log("creating file entry: " + type + " " + name);
    return html;
}

async function run_ls() {
    clear_output();
    //create headers
    document.getElementById("output").innerHTML += "<a href='#'>name</a>";
    document.getElementById("output").innerHTML += "&nbsp;".repeat(spaces - "name".length);
    await typeWriter("output", "description");
    document.getElementById("output").innerHTML += "<hr>";

    entries = $("article");
    console.log(entries);
    for (i = 0; i < entries.length; i++) {
        element = entries[i];
        description = element.getAttribute("desc");
        name = element.id;
        if (name == "") {
            continue;
        }
        document.getElementById("output").innerHTML += create_file_entry(name, "cd");
        create_handlers(); //refresh handlers list
        document.getElementById("output").innerHTML += "&nbsp;".repeat(spaces - name.length);
        document.getElementById("output").innerHTML += "<span class='description'>" +  description + "</span><br>";
        await sleep(500);
    }
    create_handlers(); //refresh handlers list

}

async function run_cd(cmd) {
    console.log(cmd);
    directory = cmd.split(" ")[1];
    directory = directory.toLowerCase();
    if (directory == ".") {
        return;
    }
    if (directory == "..") {
        window.location = "index.html";
    }

    if ($("#" + directory).length > 0) {
        //hide all articles and show only the one with #directory
        // $("article").hide();
        // $("#" + directory).show();

        window.location = "?dir=" + directory;
    } else {
        clear_output();
        await typeWriter("output", "Directory not found.");
    }

}

async function run_cat(cmd) {
    console.log("cat: " + cmd.split(" ")[1]);
    clear_output();
    file = cmd.split(" ")[1];
    file = file.toLowerCase();
    //get current directory
    dir = getURLParameter("dir");
    //try to select elements from the page with the dir
    try {
        element = $("#" + dir + "-" + file);
    } catch (e) {
        console.log("error: " + e);
        await typeWriter("output", "You can't enter tags man! Stop trynna hax me!");
    }
    
    console.log(element);
    if (element.length < 1) {
        await typeWriter("output", "File not found.");
        return;
    }

    await typeWriter("output", "displaying file...");
    html = element.html();
    document.getElementById("output").innerHTML += html;
    // window.location = "?dir=" + dir + "&file=" + file;

}

async function display_help_item(cmd, description) {
    document.getElementById("output").innerHTML += create_command(cmd);
    //a hacky way to decode cmd and get actual displayed length
    var length = $('<div>').html(cmd).text().length;
    document.getElementById("output").innerHTML += "<span class='description'>" + "&nbsp;".repeat(spaces - $('<div>').html(cmd).text().length);
    console.log(cmd, spaces - length);
    await typeWriter("output", description, "description");
    document.getElementById("output").innerHTML += "</span>"
}

async function run_help() {
    clear_output();
    await typeWriter("output", "Type commands into the prompt, or click on underlined links to navigate the site.");
    await typeWriter("output", "Available commands are (don't include the <> when you type them):");
    await typeWriter("output", " ");

    await display_help_item("help", "displays this");
    await display_help_item("ls", "displays files and directories");
    await display_help_item("dir", "same as ls");
    await display_help_item("cat &lt;file&gt;", "displays a file");
    await display_help_item("cd &lt;directory&gt;", "change directory");
    await display_help_item("echo &lt;string&gt;", "echo a string");

    await typeWriter("output", " ");
    await typeWriter("output", "Commands and names are case insensitive.");

    create_handlers(); //there will be extra things to bind to

}


async function run_echo(cmd) {
    $("#terminal").val("");
    string = cmd.split(" ").slice(1).join(" ");
    string.toLowerCase();
    clear_output();
    await typeWriter("output", string);

}


//a function that executes a command.
function system(cmd) {
    cmd = cmd.toLowerCase();
    console.log("running " + cmd);

    if (cmd.startsWith("cd")) {
        run_cd(cmd); //pass the command into cd for parsing which directory to change to
        return;
    }

    if (cmd.startsWith("cat")) {
        run_cat(cmd);
        return;
    }

    if (cmd.startsWith("ls") || cmd.startsWith("dir")) {
        return run_ls();
    }

    if (cmd.startsWith("echo")) {
        return run_echo(cmd);
    }

    switch (cmd) {
        case "help":
            run_help();
            break;

        default:
            clear_output();
            typeWriter("output", "command not found.");
            break;
    }
}