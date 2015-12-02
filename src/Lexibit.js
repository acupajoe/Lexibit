/**
 * Lexibit - a Word Ladder Solution
 *
 * Lexibit is a Data-Stucture designed to link words together of the same length that are one letter different
 * and still english words themselves. To cut down on size, words are stored in a the binary of the 32-bit integers
 * associated with the word specified at that wildcard. Letters are specified in reverse alphabetical order starting
 * at the least significant digit.
 *
 * This was created as a solution specifically for the Word Ladder Problem as an attempt to find the most efficient
 * means of traversing a tree and providing a solution.
 *
 * @link https://en.wikipedia.org/wiki/Word_ladder
 * @dependency: trie.js by Mike de Boer <info AT mikedeboer DOT nl>
 * @author: Joseph Schultz - schultzjosephj@gmail.com
 * @modified: 12/2/2015
 * @version: 1.0.1
 * @license MIT
 */
var Lexibit = (function Lexibit(lexiconUrl, commonUrl) {

    /**
     * Tree pulled in from pre-compiled dictionary
     * @type {Object}
     * @private
     */
    var _lexicon;

    /**
     * Contains an array of common words for random access
     * @type {Array}
     * @private
     */
    var _common = [];

    /**
     * Contains all searched words from the current BFS Search
     * @type {Trie}
     * @private
     */
    var _searched;

    /**
     * Length of bits we are working with for the integers
     * @type {number}
     * @private
     */
    var _bitLength = 32;

    /**
     * Offset of numbers at the end of the binary string, we only need the first 26 digits (alphabet)
     * @type {number}
     * @private
     */
    var _binaryOffset = 6;

    /**
     * Wildcard for letters in the precompiled dictionary
     * @type {string}
     * @private
     */
    var _wildcard = '&';

    /**
     * The english alphabet
     * @type {string[]}
     * @private
     */
    var _alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
        "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x",
        "y", "z"];

    /**
     * Starting word
     * @type {boolean | string}
     * @private
     */
    var _start = false;

    /**
     * Ending Word
     * @type {boolean}
     * @private
     */
    var _end = false;

    /**
     * Found position of last element.
     * @type {boolean | Position}
     * @private
     */
    var _found = false;

    /**
     * Custom Exception Handling
     * @type {{notReady: _Exception.notReady, noElements: _Exception.noElements, invalidFile: _Exception.invalidFile, invalidParameter: _Exception.invalidParameter}}
     * @private
     */
    var _Exception = {
        notReady: function () {
            throw {
                name: "not-ready",
                message: "Lexibit has not completed loading. Have the dictionaries been pulled in?",
                toString: function () {
                    return this.name + ": " + this.message;
                }
            };
        },
        noElements: function () {
            throw {
                name: "no-elements",
                message: "No elements exist in the Lexibit, check that the correct file was loaded.",
                toString: function () {
                    return this.name + ": " + this.message;
                }
            };
        },
        invalidFile: function () {
            throw {
                name: "invalid-file",
                message: "Invalid file. Be sure you have the correct url.",
                toString: function () {
                    return this.name + ": " + this.message;
                }
            };
        },
        invalidParameter: function (msg) {
            throw {
                name: "invalid-parameter",
                message: "Parameters have not met the specifications. " + msg,
                toString: function () {
                    return this.name + ": " + this.message;
                }
            };
        }
    };

    /**
     * Get Function that does not rely on jQuery, provides a success and error handler.
     * @param url
     * @param successHandler
     * @param errorHandler
     * @private
     */
    var _get = function (url, successHandler, errorHandler) {
        var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest()
            : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('get', url, true);
        xhr.onreadystatechange = function () {
            var status;
            var data;
            // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
            if (xhr.readyState == 4) { // `DONE`
                status = xhr.status;
                if (status == 200) {
                    data = xhr.responseText;
                    if (successHandler) {
                        successHandler && successHandler(data);
                    } else {
                        return data;
                    }
                } else {
                    errorHandler && errorHandler(status);
                }
            }
        };
        xhr.send();
    };

    /**
     * Breadth - First Search, start at the initial position, check all children for matching to the final destination,
     * if they don't match, push to queue, break when found.
     * @param start
     * @returns {boolean|Position}
     * @private
     */
    var _bfs = function (start) {
        var p, n;
        var q = [];
        _searched.add(start.word);
        _process(start);
        q.push(start);
        while (q.length > 0 && _found == false) {
            p = q.shift();
            p.children().forEach(function (n) {
                if (!_searched.find(n.word)) {
                    _searched.add(n.word);
                    _process(n);
                    q.push(n);
                }
            });
        }
        return _found;
    };

    /**
     * Called from BFS - evaluates a match.
     * @param pos
     * @private
     */
    var _process = function (pos) {
        if (pos.word == _end) {
            _found = pos;
        }
    };

    /**
     * Gets a random
     * @param min
     * @param max
     * @returns {*}
     */
    var _getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * Create a full 32-bit binary string from a number
     * @param nMask
     * @returns {string}
     * @private
     */
    var _createBinaryString = function (nMask) {
        // nMask must be between -2147483648 and 2147483647
        for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32;
             nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
        return sMask;
    };

    /**
     * Position - accessory class to help order the children of the _lexicon. Contains functionality for
     * converting the children integers into binary string / words that can be used to BFS on.
     * @param prev
     * @param word
     * @constructor
     */
    var Position = function (prev, word) {
        /**
         * Previous object to tie back to
         * @type {Position}
         */
        this.prev = prev;

        /**
         * Word that is the parent of children
         * @type {String}
         */
        this.word = word;

        /**
         * Contains the wildcard children with their integers.
         * @type {Object}
         */
        this.obj = _lexicon[word];

        /**
         * Children - generates an array of available words that are one letter different than the root word (this.word)
         * @returns {Array}
         */
        this.children = function () {
            var result = [];
            var key, integer, binary, r_cursor;

            //Be sure we have a valid object.
            if (this.obj && Object.keys(this.obj).length > 0) {
                for (var i = 0; i < Object.keys(this.obj).length; i++) {
                    //Current Key (d_g) with wildcard
                    key = Object.keys(this.obj)[i];
                    integer = this.obj[key];
                    binary = _createBinaryString(integer).substr(_binaryOffset, _bitLength - _binaryOffset);
                    r_cursor = _alphabet.length - 1;
                    for (var j = 0; j < binary.length; j++) {
                        if (binary.charAt(j) == '1') {
                            result.push(new Position(this, key.replace(_wildcard, _alphabet[r_cursor])));
                        }
                        r_cursor--;
                    }
                }
            }
            return result;
        }
    };

    /**
     * Lexibit - takes two paramaters - urls for dictionaries.
     * @param lexiconUrl
     * @param commonUrl
     * @returns {Lexibit}
     * @constructor
     */
    function Lexibit(lexiconUrl, commonUrl) {
        this.length;
        this.ready = false;
        var _this = this;
        _get(lexiconUrl, function (data) {
            _lexicon = eval("(" + data + ")");
            _this.length = Object.keys(_lexicon)[0].length;
            _get(commonUrl, function (data) {
                var d = data.split(",");
                for (var i = 0; i < d.length; i++) {
                    if (d[i].length == _this.length) {
                        _common.push(d[i]);
                    }
                }
                _this.ready = true;
            }, _Exception.invalidFile);
        }, _Exception.invalidFile);

        return this;
    }

    Lexibit.prototype = {
        /**
         * Returns if the function is ready or not.
         * @returns {boolean}
         */
        isReady: function () {
            return this.ready;
        },

        /**
         * Finds a pair of words that have a known path between them.
         * @returns {{one: *, two: *, path: boolean}}
         */
        randomCommonWordPair: function () {
            var one, two;
            var p = false;
            while (!p) {
                one = _common[_getRandomInt(0, _common.length)];
                two = _common[_getRandomInt(0, _common.length)];
                p = this.path(one, two);
            }
            return {one: one, two: two, path: p};
        },

        /**
         * Path - Find the shortest path between two words.
         * @param start
         * @param end
         * @returns {boolean|Position}
         */
        path: function (start, end) {
            if (!this.ready) {
                _Exception.notReady();
            }
            if (!start || !end) {
                return false;
            }
            if (start.length != this.length || end.length != this.length) {
                _Exception.invalidParameter("Words must be of length " + this.length);
            }
            var s = _lexicon[start];
            var e = _lexicon[end];
            _end = end;
            _found = false;
            _searched = new Trie();
            _bfs(new Position(null, start));
            return _found;
        },

        /**
         * Size - size of the lexicon tree we are working with.
         * @returns {Number}
         */
        size: function () {
            return Object.keys(_lexicon).length;
        }
    };

    return Lexibit;
})();