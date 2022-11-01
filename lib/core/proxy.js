/* 
MIT License

Copyright (c) 2022 NEBULA SERVICES 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


// framework variables 
var __adjectives = ["admiring", "adoring", "affectionate", "agitated", "amazing", "angry", "awesome", "beautiful", "blissful", "bold", "boring", "brave", "busy", "charming", "clever", "cool", "compassionate", "competent", "condescending", "confident", "cranky", "crazy", "dazzling", "determined", "distracted", "dreamy", "eager", "ecstatic", "elastic", "elated", "elegant", "eloquent", "epic", "exciting", "fervent", "festive", "flamboyant", "focused", "friendly", "frosty", "funny", "gallant", "gifted", "goofy", "gracious", "great", "happy", "hardcore", "heuristic", "hopeful", "hungry", "infallible", "inspiring", "interesting", "intelligent", "jolly", "jovial", "keen", "kind", "laughing", "loving", "lucid", "magical", "mystifying", "modest", "musing", "naughty", "nervous", "nice", "nifty", "nostalgic", "objective", "optimistic", "peaceful", "pedantic", "pensive", "practical", "priceless", "quirky", "quizzical", "recursing", "relaxed", "reverent", "romantic", "sad", "serene", "sharp", "silly", "sleepy", "stoic", "strange", "stupefied", "suspicious", "sweet", "tender", "thirsty", "trusting", "unruffled", "upbeat", "vibrant", "vigilant", "vigorous", "wizardly", "wonderful", "xenodochial", "youthful", "zealous", "zen",]
var __surnames = ["albattani", "allen", "almeida", "antonelli", "agnesi", "archimedes", "ardinghelli", "aryabhata", "austin", "babbage", "banach", "banzai", "bardeen", "bartik", "bassi", "beaver", "bell", "benz", "bhabha", "bhaskara", "black", "blackburn", "blackwell", "bohr", "booth", "borg", "bose", "bouman", "boyd", "brahmagupta", "brattain", "brown", "buck", "burnell", "cannon", "carson", "cartwright", "carver", "cerf", "chandrasekhar", "chaplygin", "chatelet", "chatterjee", "chebyshev", "cohen", "chaum", "clarke", "colden", "cori", "cray", "curran", "curie", "darwin", "davinci", "dewdney", "dhawan", "diffie", "dijkstra", "dirac", "driscoll", "dubinsky", "easley", "edison", "einstein", "elbakyan", "elgamal", "elion", "ellis", "engelbart", "euclid", "euler", "faraday", "feistel", "fermat", "fermi", "feynman", "franklin", "gagarin", "galileo", "galois", "ganguly", "gates", "gauss", "germain", "goldberg", "goldstine", "goldwasser", "golick", "goodall", "gould", "greider", "grothendieck", "haibt", "hamilton", "haslett", "hawking", "hellman", "heisenberg", "hermann", "herschel", "hertz", "heyrovsky", "hodgkin", "hofstadter", "hoover", "hopper", "hugle", "hypatia", "ishizaka", "jackson", "jang", "jemison", "jennings", "jepsen", "johnson", "joliot", "jones", "kalam", "kapitsa", "kare", "keldysh", "keller", "kepler", "khayyam", "khorana", "kilby", "kirch", "knuth", "kowalevski", "lalande", "lamarr", "lamport", "leakey", "leavitt", "lederberg", "lehmann", "lewin", "lichterman", "liskov", "lovelace", "lumiere", "mahavira", "margulis", "matsumoto", "maxwell", "mayer", "mccarthy", "mcclintock", "mclaren", "mclean", "mcnulty", "mendel", "mendeleev", "meitner", "meninsky", "merkle", "mestorf", "mirzakhani", "moore", "morse", "murdock", "moser", "napier", "nash", "neumann", "newton", "nightingale", "nobel", "noether", "northcutt", "noyce", "panini", "pare", "pascal", "pasteur", "payne", "perlman", "pike", "poincare", "poitras", "proskuriakova", "ptolemy", "raman", "ramanujan", "ride", "montalcini", "ritchie", "rhodes", "robinson", "roentgen", "rosalind", "rubin", "saha", "sammet", "sanderson", "satoshi", "shamir", "shannon", "shaw", "shirley", "shockley", "shtern", "sinoussi", "snyder", "solomon", "spence", "stonebraker", "sutherland", "swanson", "swartz", "swirles", "taussig", "tereshkova", "tesla", "tharp", "thompson", "torvalds", "tu", "turing", "varahamihira", "vaughan", "visvesvaraya", "volhard", "villani", "wescoff", "wilbur", "wiles", "williams", "williamson", "wilson", "wing", "wozniak", "wright", "wu", "yalow", "yonath", "zhukovsky",];
var _chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#.';
var _nums = '123456789'
var _punct = '#./'
var _letts_caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
var _letts_lwr = 'abcdefghijklmnopqrstuvwxyz'

var _bad_words = ["4r5e", "5h1t", "5hit", "a55", "anal", "anus", "ar5e", "arrse", "arse", "ass", "ass-fucker", "asses", "assfucker", "assfukka", "asshole", "assholes", "asswhole", "a_s_s", "b!tch", "b00bs", "b17ch", "b1tch", "ballbag", "balls", "ballsack", "bastard", "beastial", "beastiality", "bellend", "bestial", "bestiality", "bi+ch", "biatch", "bitch", "bitcher", "bitchers", "bitches", "bitchin", "bitching", "bloody", "blow job", "blowjob", "blowjobs", "boiolas", "bollock", "bollok", "boner", "boob", "boobs", "booobs", "boooobs", "booooobs", "booooooobs", "breasts", "buceta", "bugger", "bum", "bunny fucker", "butt", "butthole", "buttmuch", "buttplug", "c0ck", "c0cksucker", "carpet muncher", "cawk", "chink", "cipa", "cl1t", "clit", "clitoris", "clits", "cnut", "cock", "cock-sucker", "cockface", "cockhead", "cockmunch", "cockmuncher", "cocks", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocksucks", "cocksuka", "cocksukka", "cok", "cokmuncher", "coksucka", "coon", "cox", "crap", "cum", "cummer", "cumming", "cums", "cumshot", "cunilingus", "cunillingus", "cunnilingus", "cunt", "cuntlick", "cuntlicker", "cuntlicking", "cunts", "cyalis", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking", "d1ck", "damn", "dick", "dickhead", "dildo", "dildos", "dink", "dinks", "dirsa", "dlck", "dog-fucker", "doggin", "dogging", "donkeyribber", "doosh", "duche", "dyke", "ejaculate", "ejaculated", "ejaculates", "ejaculating", "ejaculatings", "ejaculation", "ejakulate", "f u c k", "f u c k e r", "f4nny", "fag", "fagging", "faggitt", "faggot", "faggs", "fagot", "fagots", "fags", "fanny", "fannyflaps", "fannyfucker", "fanyy", "fatass", "fcuk", "fcuker", "fcuking", "feck", "fecker", "felching", "fellate", "fellatio", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fingerfucks", "fistfuck", "fistfucked", "fistfucker", "fistfuckers", "fistfucking", "fistfuckings", "fistfucks", "flange", "fook", "fooker", "fuck", "fucka", "fucked", "fucker", "fuckers", "fuckhead", "fuckheads", "fuckin", "fucking", "fuckings", "fuckingshitmotherfucker", "fuckme", "fucks", "fuckwhit", "fuckwit", "fudge packer", "fudgepacker", "fuk", "fuker", "fukker", "fukkin", "fuks", "fukwhit", "fukwit", "fux", "fux0r", "f_u_c_k", "gangbang", "gangbanged", "gangbangs", "gaylord", "gaysex", "goatse", "God", "god-dam", "god-damned", "goddamn", "goddamned", "hardcoresex", "hell", "heshe", "hoar", "hoare", "hoer", "homo", "hore", "horniest", "horny", "hotsex", "jack-off", "jackoff", "jap", "jerk-off", "jism", "jiz", "jizm", "jizz", "kawk", "knob", "knobead", "knobed", "knobend", "knobhead", "knobjocky", "knobjokey", "kock", "kondum", "kondums", "kum", "kummer", "kumming", "kums", "kunilingus", "l3i+ch", "l3itch", "labia", "lust", "lusting", "m0f0", "m0fo", "m45terbate", "ma5terb8", "ma5terbate", "masochist", "master-bate", "masterb8", "masterbat*", "masterbat3", "masterbate", "masterbation", "masterbations", "masturbate", "mo-fo", "mof0", "mofo", "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker", "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin", "motherfucking", "motherfuckings", "motherfuckka", "motherfucks", "muff", "mutha", "muthafecker", "muthafuckker", "muther", "mutherfucker", "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah", "niggas", "niggaz", "nigger", "niggers", "nob", "nob jokey", "nobhead", "nobjocky", "nobjokey", "numbnuts", "nutsack", "orgasim", "orgasims", "orgasm", "orgasms", "p0rn", "pawn", "pecker", "penis", "penisfucker", "phonesex", "phuck", "phuk", "phuked", "phuking", "phukked", "phukking", "phuks", "phuq", "pigfucker", "pimpis", "piss", "pissed", "pisser", "pissers", "pisses", "pissflaps", "pissin", "pissing", "pissoff", "poop", "porn", "porno", "pornography", "pornos", "prick", "pricks", "pron", "pube", "pusse", "pussi", "pussies", "pussy", "pussys", "rectum", "retard", "rimjaw", "rimming", "s hit", "s.o.b.", "sadist", "schlong", "screwing", "scroat", "scrote", "scrotum", "semen", "sex", "sh!+", "sh!t", "sh1t", "shag", "shagger", "shaggin", "shagging", "shemale", "shi+", "shit", "shitdick", "shite", "shited", "shitey", "shitfuck", "shitfull", "shithead", "shiting", "shitings", "shits", "shitted", "shitter", "shitters", "shitting", "shittings", "shitty", "skank", "slut", "sluts", "smegma", "smut", "snatch", "son-of-a-bitch", "spac", "spunk", "s_h_i_t", "t1tt1e5", "t1tties", "teets", "teez", "testical", "testicle", "tit", "titfuck", "tits", "titt", "tittie5", "tittiefucker", "titties", "tittyfuck", "tittywank", "titwank", "tosser", "turd", "tw4t", "twat", "twathead", "twatty", "twunt", "twunter", "v14gra", "v1gra", "vagina", "viagra", "vulva", "w00se", "wang", "wank", "wanker", "wanky", "whoar", "whore", "willies", "willy", "xrated", "xxx"];

var doc = document;

var val = doc.value;


var __RandomGenerationDevice = class __RandomGenerationDevice {
  varructor() {
    this.name = function() {
      var randomNumber = Math.floor(Math.random() * (__adjectives.length - 0) + 0);
      var random1 = randomNumber;
      var random2 = randomNumber;
      var adjective = __adjectives[random1];
      var surname = __surnames[random2];
      var randomName = adjective + "_" + surname;
      return randomName;
    };
    this.number = function(length) {
      let result = ' ';
      var charactersLength = _nums.length;
      for (let i = 0; i < length; i++) {
        result += _nums.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    };
  }
}
var random = new __RandomGenerationDevice();
var __TabController = class __TabController {
  varructor() {
    this.name = doc.title;
    this.setName = function(title, saveState) {
      doc.title = title;
      return title;
    };
    this.reload = function() {
      location.reload();
    };


  }
}
var tab = new __TabController();
var __ElementTools = class __ElementTools {
  varructor() {
    this.getByID = function(id) {
      var a = document.getElementById(id)
      return a;
    }
    this.create = function(elemType, id, _class, appendTo) {
      var eleme = document.createElement(elemType);
      eleme.id = id;
      eleme.classList.add(_class);
      var node = document.createTextNode(" ");
      eleme.appendChild(node);
      if (appendTo == null) {
        var a = document.body;
        a.appendChild(eleme);
      } else {
        var a = document.getElementById(appendTo);
        a.appendChild(eleme);
      }
      let final = document.getElementById(id);
      return final;
    };
    this.addTextContent = function(_text, __id) {
      var node = document.getElementById(__id);
      node.innerText += _text;
      return node;
    };
    this.delete = function(_id) {
      var node = document.getElementById(_id);
      node.remove();
      return true;
    };
    this.addHTMLContent = function(_html, __id) {
      var node = document.getElementById(__id);
      node.innerHTML += _html;
      return node;
    }

  }
}
var element = new __ElementTools()

// framework functions 
var getLocalItem = function(key) {
  try {
    var b = localStorage.getItem(key)
    return b;
  } catch (err) {
    log.err('An internal error occured')
  }
}
var setLocalItem = function(key, value) {
  var b = localStorage.setItem(key, value)
  log.log('Set Local Storage Item with key of "' + key + '"')
  return b;
}
function content(_content) {
  return _content;
}
var __SystemLogging = class __SystemLogging {
  varructor(_log) {
    this.log = function(__log) {
      console.log(__log);
    };
    this.warn = function(__log) {
      console.warn(__log);
    };
    this.err = function(__log) {
      console.error(__log);
    };
    this.clean = function(){
      return console.clear()
    }
  }
}

var log = new __SystemLogging()
// blank.new('https://google.com', 'guggle', 'https://nebulaproxy.nebula.bio/images/logo.png')
var __AboutBlankEngine = class __AboutBlankEngine {
  varructor() {
    this.destroy = function(__reason) {
      if (__reason !== null) {
      window.alert('Window Closed because "'+ __reason + '"')
      } else {
        
      }
    }
    this.new = function(location, title, favicon) {
      let inFrame;
      try {
        inFrame = window !== top;
      } catch (e) {
        inFrame = true;
      }
      if (location == null) {
        log.err("Location cannot be undefined. ");
        return false;
      }
      if (!inFrame && !navigator.userAgent.includes("Firefox")) {
        var popup = open("about:blank", "_blank");
        if (!popup || popup.closed) {
          alert("Popups are disabled!");
        } else {
          var docu = popup.document;
          var iframe = docu.createElement("iframe");
          var style = iframe.style;
          var img = docu.createElement("link");
          var link = location.href;
          img.rel = "icon";
          if (favicon == null) {

            img.href = "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png"
          } else {
            img.href = favicon;
          }

          if (title == null) {
            docu.title = "Google Drive";
            log.warn('Title setting was left undefined.');
          } else {
            docu.title = title;
          }

          iframe.src = location;

          style.position = "fixed";
          style.top = style.bottom = style.left = style.right = 0;
          style.border = style.outline = "none";
          style.width = style.height = "100%";
          docu.body.appendChild(iframe);
        }

      }
    };

  }
}

var blank = new __AboutBlankEngine();


// This is unfinished code
// v0.0.6