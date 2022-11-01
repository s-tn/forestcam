Array.prototype.get = function(start, count) {
    var n = [...this].splice(start);

    n.splice(start+count);

    return n;
}

Array.prototype.random = function(n) {
    if (!n) return this[Math.floor(Math.random()*this.length)];
    var result = new Array(n),
        len = this.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = this[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}
