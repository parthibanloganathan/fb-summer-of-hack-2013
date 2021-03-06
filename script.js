// GLOBAL SETTINGS
var on;
var language;
var difficulty = "1";
var volume = "0";

// initialize on load
function load(callback) {
  chrome.storage.sync.get(['status', 'volume', 'lang', 'diff'], function(data) {
    on = data.status;
    language = data.lang;
    difficulty = data.diff;
    volume = data.volume;

    if(on == "on") {
        callback();
    }
  });
}

$(document).ready(function () {

  load(function() {

    // Bind playSpeech function
    function playSpeech(text) {
        // If sound is on
        if (volume == "1") {
            if ($('#translate-video').length > 0) {

                // Make text URL safe
                text = text.replace(' ','+').replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");

                // If the text can fit in a single call
                if (text.length < 100) {
                    $('#translate-video').attr('src', 'http://translate.google.com/translate_tts?tl=' + language + '&q=' + text);
                } else {
                    // Else split it up into 100 char chunks and play it piece by piece
                    var i = 0;

                    while (i+99 < text.length) {
                        subtext = text.substring(i, i+99);
                        $('#translate-video').attr('src', 'http://translate.google.com/translate_tts?tl=' + language + '&q=' + subtext);
                        $('translate-video')[0].load();
                        i += 100;
                    }

                    // Play last bit
                    subtext = text.substring(i, text.length-1);
                    $('#translate-video').attr('src', 'http://translate.google.com/translate_tts?tl=' + language + '&q=' + subtext);
                    $('translate-video')[0].load();
                }
            } else {
                $('body').append("<video controls='' autoplay name='media'  id='translate-video' style='display:none'><source id='video-source' src='' type='audio/mpeg'></video>");
                playSpeech(text);
            }
        }
    }

    // Translate text
    function translate(from, to, text, cb) {
      $.ajax({
        url: 'http://api.microsofttranslator.com/V2/Ajax.svc/Translate?oncomplete=?&appId=68D088969D79A8B23AF8585CC83EBA2A05A97651&from=' + from + '&to=' + to + '&text=' + encodeURIComponent(text),
        type: "GET",
        success: function(data) {
          cb(decodeURIComponent(data.substr(1, data.length - 2)));
        }
      });
    }

    // Split Functions
    function splitByWord(difficulty) {
      $('p').each(function() {
        var word = $(this).getWord(difficulty);
        var that = this;
        translate('en', language, word, function (translatedWord) {
          $(that).html($(that).html().replace(/<\/*.+?>/g, '').replace(new RegExp("\\b" + word + "\\b", 'i'), "<span class='translate_14385' style='background-color: #FFFAB0; color: #000000' data-original=\"" + word + "\">" + translatedWord + "</span>"));
          $('.translate_14385').click(function() {
            playSpeech(translatedWord);
          });
        });
      });
    }

    function splitBySentence(difficulty, probability) {
      $('p').each(function() {
        var rand = Math.random() * 10;
        if (rand < probability) {
          var sentence = $(this).getSentence(difficulty);
          var that = this;
          translate('en', language, sentence, function (translatedSentence) {
            $(that).html($(that).html().replace(/<\/*.+?>/g, '').replace(sentence, "<span class='translate_14385' style='background-color: #FFFAB0; color: #000000' data-original=\"" + sentence + "\">" + translatedSentence + "</span>"));
            $('.translate_14385').click(function() {
              playSpeech($(this).text());
            });
          });
        }
      });
    }

    if (difficulty == 1) {
      splitByWord('easy');
    } else if (difficulty == 2) {
      splitByWord('hard');
    } else if (difficulty == 3) {
      splitBySentence('easy', 4);
    } else if (difficulty == 4) {
      splitBySentence('medium', 6);
    } else if (difficulty == 5) {
      splitBySentence('hard', 11);
    }

  });
});
