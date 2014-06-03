//The MIT License
// Thanks to Gábor Molnár
//Copyright (C) 2012 Gábor Molnár gabor.molnar@sch.bme.hu

var schema = require('./bin/init.js')
            ;


var Duck = schema({
    api: String,
    v: [],
    ret: Array,
    data: {
        a: Array,
        b: Function
    }
})

var mTop = {
    "api" : "mtop.msp.game.hjggk.doAward",
    "v" : [],
    "ret" :
    [
        "ACTIVITY_IS_END::活动已结束"
    ],
    "data" :
    {

    }
}


console.log(Duck(mTop));