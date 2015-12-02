# Lexibit

Author: Joseph Schultz - schultzjosephj@gmail.com

Contributor: Erich Wu - erich@unconfusing.com

Original structure idea from - [Tony D](https://stackoverflow.com/users/410767/tony-d), and  [Ike](https://stackoverflow.com/users/4842163/ike)

## Overview:

- A trie is efficient for finding words that exist within the trie, not particularly for traversing up and around the trie.
- If we are searching for a 3 letter word, **ALL** three letter words would be on the same level of the Trie. (A three letter word would be **Root->&->&->WORD,** for all three letter words that exist)

The primary goal of this solution is to provide a quick and accurate means to search for words that meet the criteria of a single wildcard. i.e, '_at' for cat or 'd_g' for dog as every step has to meet the requirement of being a SINGLE character different.

So the next idea would be to create a data structure that provides links precalculates links between all words. However doing so you run into issues of calculating and populating the list that meets space requirements AS WELL as the issue of looking up the words.

The solution has to find a way to produce a result that allows us to easily navigate through it with a reduced time complexity and a manageable file size. <br/> <br/>

Create a list of words, separated by length. `3: {'cat', 'dog', 'man', 'can' ...}, 4: {'runt','bunt','hint','chin'}, 5: { ...` for each of these words create a sub list, for the sake of simplicity we will expand using the three letter words 'cat' and 'dog'.

  **The goal is to take a wild card letter, and find all of the places where a word exists with the wildcard changed, and map it to a single bit of the 32-bit integer using the alphabet as the index. (a = 0th digit, b = 1st digit, c = 2nd digit, d = 3rd digit) and use a `0` to specify no word or a `1` to specify a word exists with the letter at that index.**


So the final data structure would look like this:

```
{
  "cat":{"&at":7331062,"c&t":1064961,"ca&":21671946}
  "dog":{"&og":4733614,"d&g":1065217,"do&":5126228}
   ....
}
```

Which provides all potential words for a single word that is one letter different than the original.
