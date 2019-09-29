const XDR = require('js-xdr')
import { toJSON } from 'json-xdr';
import { toXDR } from 'json-xdr';

const types = XDR.config((xdr) => {
    xdr.typedef("Hash", xdr.opaque(2));
    xdr.typedef('Int32', xdr.int());

    xdr.struct("Price", [
        ["n", xdr.lookup("Int32")],
        ["d", xdr.lookup("Int32")],
    ]);

    xdr.enum("MemoType", {
        memoNone: 0,
        memoText: 1,
        memoId: 2,
        memoHash: 3,
        memoReturn: 4,
    });

    xdr.enum("RateType", {
        HERTZ: 1,
        SECONDS: 0,
    });

    xdr.union("Memo", {
        switchOn: xdr.lookup("MemoType"),
        switchName: "type",
        switches: [
            ["memoNone", xdr.void()],
            ["memoText", "text"],
            ["memoId", "id"]
        ],
        arms: {
            text: xdr.string(28),
            id: xdr.lookup("Int32")
        },
    });

    xdr.typedef('CounterInt', xdr.option(xdr.int()));

    xdr.struct('Event', [
        ["attendees", xdr.int()],
        ["sampleRateType", xdr.lookup("RateType")],
        ["sampleRate", xdr.int()],
        ["points", xdr.int()],
        ["timestamp", xdr.hyper()],
        ["value", xdr.float()],
        // ["eventName", xdr.string(50)],
        // ["secretSpeakers", xdr.array(xdr.lookup("Hash"), 2)],
        // ["speakers", xdr.varArray(xdr.string())],
        // ["price", xdr.lookup("Price")],
        // ["memo", xdr.lookup("Memo")],
        // ['meta', xdr.lookup('TransactionMeta')],
        // ['counter', xdr.lookup("CounterInt")]
    ])

    xdr.enum("TransactionMetaType", {
        none: 0,
        paid: 1
    });

    xdr.union("TransactionMeta", {
        switchOn: xdr.lookup("TransactionMetaType"),
        switches: [
            ["none", xdr.void()],
            ["paid", "price"]
        ],
        arms: {
            price: xdr.lookup("Price")
        },
        defaultArm: xdr.void()
    });
})

var HERTZ = 1;

let event = new types.Event({
    attendees: 2,
    sampleRateType: types.RateType.fromName('HERTZ'),
    sampleRate: 30,
    points: 1,
    timestamp: XDR.Hyper.fromString("1560710010854699520"),
    value: 0.05,
    // eventName: "Lumenauts get together",
    // secretSpeakers: [Buffer.from([0, 0]), Buffer.from([0, 1])],
    // speakers: ['Jed', 'Tom', 'Zac'],
    // price: new types.Price({
    //     n: 2,
    //     d: 1
    // }),
    // memo: types.Memo.memoText("foo"),
    // meta: types.TransactionMeta.paid(new types.Price({
    //     n: 2,
    //     d: 1
    // })),
    // counter: 2
})

let payloadJSON = {
    "attendees": 2,
    "sampleRateType": "HERTZ",
    "sampleRate": 30,
    "points": 1,
    "timestamp": XDR.Hyper.fromString("101"),
    "eventName": "Lumenauts get together",
    "secretSpeakers": [
        "AAA=",
        "AAE="
    ],
    "speakers": [
        "Jed",
        "Tom",
        "Zac"
    ],
    "price": {
        "n": 2,
        "d": 1
    },
    "memo": {
        "_type": "memoText",
        "text": "foo"
    },
    "meta": {
        "_type": "paid",
        "price": {
            "n": 2,
            "d": 1
        }
    },
    "counter": 2
}

// let eventXDR = toXDR(types.Event, payloadJSON);

// let result = eventXDR.toXDR();

console.log(event.toXDR());
// console.log(eventXDR.toXDR());
// console.log(result.join(""));


// const myString = result.join("");
// const encoded = new Buffer(myString).toString('hex'); // encoded === 54686973206973206d7920737472696e6720746f20626520656e636f6465642f6465636f646564
// const decoded = new Buffer(encoded, 'hex').toString(); // decoded === "This is my string to be encoded/decoded"

// console.log(encoded);



if (false) {

    let xdr = XDR.config((xdr) => {
        xdr.struct('Signature', [
          ['publicKey', xdr.opaque(32)],
          ['data', xdr.opaque(32)]
        ]);
      
        xdr.struct('Envelope', [
          ['body', xdr.varOpaque(1000)],
          ['timestamp', xdr.uint()],
          ['signature', xdr.lookup('Signature')]
        ]);
      });
      
      let sig = new xdr.Signature();
      sig.publicKey(Buffer.alloc(32));
      sig.data(Buffer.from('00000000000000000000000000000000'));
      
      let env = new xdr.Envelope({
        signature: sig,
        body: Buffer.from('hello'),
        timestamp: Math.floor(new Date() / 1000)
      });
      
      let output = env.toXDR();
      let parsed = xdr.Envelope.fromXDR(output);
      
      console.log(env);
      console.log(output);
      console.log(parsed);

}