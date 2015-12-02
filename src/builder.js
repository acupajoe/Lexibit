/**
 * Dictionary Builder
 *
 * This is a simple node program that accepts 2 arguments, first being the input lexicon (dictionary) and second being the
 * letter length you want from the dictionary (3, 4, 5, 6, etc.). Will output a file in the same working directory as the script.
 *
 * @author: Joseph Schultz - schultzjosephj@gmail.com
 * @version: 1.0.0
 * @license MIT
 */

var fs = require('fs');
include('trie.js');

var args = process.argv.slice(2);
var inputFile = args[0];
var wordLength = args[1];
var filename = "-letter.obj";
var trie = new Trie();
var object = {};
var wildcard = "&";
var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
    "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x",
    "y", "z"];

if (!args || args.length < 2) {
    console.log("Error: Arguments inputFile {string: relative path}  and wordLength {int} must be specified");
    return false;
}


fs.readFile(inputFile, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    var d = data.split(',');
    for (var i = 0; i < d.length; i++) {
        if (d[i].length == wordLength) {
            trie.add(d[i].toLowerCase());
            object[d[i].toLowerCase()] = {}
        }
    }
    build();
    write();
});

/**
 * Read in a file and return its contents as a string.
 * @param f
 * @returns {string|*}
 */
function read(f) {
    return fs.readFileSync(f).toString();
}

/**
 * Include a vanilla javascript file's functions into the global namespace.
 * @param f
 */
function include(f) {
    eval.apply(global, [read(f)]);
}

/**
 * Build our final object, loop through keys, add wildcard children keys with integer values.
 */
function build() {
    for (var i = 0; i < Object.keys(object).length; i++) {
        var k = Object.keys(object)[i];
        object[k] = {};
        for (var j = 0; j < k.length; j++) {
            var w = k.replaceAt(j, wildcard);
            object[k][w] = new Number();
            for (var l = 0; l < alphabet.length; l++) {
                if (trie.find(w.replaceAt(j, alphabet[l]))) {
                    pos = (alphabet[l].charCodeAt(0) - 'a'.charCodeAt(0));
                    object[k][w] = object[k][w] | (1 << pos);
                }
            }
        }
    }
}

/**
 * Write object to file
 */
function write() {
    fs.writeFileSync(wordLength + filename, JSON.stringify(object), 'utf8');
}

/**
 * Replace a character in a string by its position
 * @param index
 * @param character
 * @returns {string}
 */
String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
};