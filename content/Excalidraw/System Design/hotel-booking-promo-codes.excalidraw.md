---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'


# Excalidraw Data

## Text Elements
Hotel booking with promo codes ^QZL9N7Ew

System design - HLD + LLD + SQL.  Two inventories being consumed at once (rooms and coupon redemptions), each with its own overselling problem,
joined by one payment that can fail.  Database choice, schema, API, and what happens when the user hits Book twice. ^YNzKo21N

PostgreSQL ^KLIn1ZoM

Idempotency keys ^iVi2LLBS

Guarded UPDATE ^hRE3uuuh

Saga compensation ^wa78ike7

Node.js / SQL ^YXzGov94

Colour key ^Ph9h1Str

Say this out loud / context ^EsIzhAtQ

The line that scores ^zbTlYTLA

Numbers / trade-off to defend ^mVhCdebj

Trap - name it before they ask ^yPo5NGBK

Map ^EikowdZx

01 Frame the problem ^00nM59NJ

02 Back-of-envelope ^QLtOMJti

03 Which database ^P4CbY5B7

04 The schema ^df799WTu

05 Discount engine ^retqgY9Z

06 The three races ^wRDTxmCf

07 Double-click ^BOlp107o

08 API design ^P2qqTJvA

09 Failure & saga ^qiljqKUd

10 Follow-ups ^ww568oMr

11 45-minute script ^sKisppSJ

01 ^UobTbnf3

Frame the problem ^AdM0sElp

The one-line thesis to open with - it reframes the whole question and every later answer follows from it. ^60ZCZh8V

OPEN WITH THIS ^Bbm3Hvqx

"There are two independent scarce resources here - rooms on specific dates, and coupon redemptions - and a booking has to consume both
atomically or neither. So the core of this design isn't the schema, it's where I put the concurrency control. That pushes me straight to a relational
database, because it already does this correctly and I'd otherwise be rebuilding it badly." ^XWOm5wJy

Clarifying questions to ask ^TEJValbI

- Is the room count real inventory or a channel allocation? Hotels sell the same rooms via Booking.com, Expedia and their own site - is our count
authoritative, or a slice we sync?
- Can we oversell? Airlines deliberately do. Hotels usually do not. Decides whether the guard is a hard constraint or a soft one.
- Pay now or pay at hotel? Decides whether payment is on the booking critical path at all.
- Does a cancelled booking give the coupon back? A product decision that changes the uniqueness constraint - show both.
- Multi-currency? A INR 500 coupon cannot apply to a USD booking. Does the promo carry a currency, or do we convert?
- Can coupons stack? Assume no - but design the engine so stacking is a later change, not a rewrite.
- Promo scope: global, or restricted to certain hotels / cities / room types / first-time users? ^08t2qSOk

Requirements ^712NiEin

Functional ^nDALJYWr

Non-functional ^KX84Xtaj

Search availability, hold rooms, apply a promo, book, pay ^91YS7Cil

Never oversell a room. Hard invariant ^omkfvhZO

Preview the discount before committing (price breakdown) ^aWzJdD9D

Never over-redeem a promo past its cap ^KciXDwTg

Validate promo against window, cap, per-user limit, min order ^9TFrq33a

Booking write path p99 < 300 ms ^aEWGbSNU

Cancel and refund; decide whether the coupon returns ^0jZT8e8H

Exactly one booking per user intent, under retries ^q4llrmch

Admin creates / pauses / edits promos at runtime ^UY4wJTzP

Every money movement auditable and reconcilable ^XYBkX72T

THE CURRENTAVAILABLE DECISION - SAY THIS, IT SCORES ^tvA4Wjr7

They named a field called currentAvailable, and the instinct is to store a remaining counter and decrement it. Store a monotonic used_count plus the
cap instead, and derive remaining. Two reasons: raising the cap mid-campaign becomes a plain UPDATE to one column that never races with
consumption, and used_count stays reconcilable against COUNT(*) on the redemptions table - a decrementing counter with a mutable cap can't be
audited against anything. ^LvlQPWrb

The promo fields they gave you, translated ^6snFjxMQ

Interview wording ^sVayWYEp

Field ^35wHFX8n

What it really constrains ^0s0jkTPA

fixed or percentage ^bsMLTTie

discount_type + percent_bps / fixed_amount ^RcLvQv1c

Two shapes in one table - needs a CHECK constraint so the wrong column can't be set ^x6u3rnlm

expiry ^EFp7Uau1

starts_at, ends_at ^RJNNI3AN

Always a window, never just an end. Timezone-aware, stored UTC ^2jPTC3xP

max discount ^UJjhoYk0

max_discount ^lgt8pjUT

Caps a percentage coupon. "20% off, up to INR 1000" ^6fz165Pb

fixed amt / min amount ^X3WR2rKt

min_order_value ^15vd3GYC

Floor on the eligible subtotal. Checked BEFORE discount, never after ^8gFyBLAR

currentAvailable ^2BZrWaKG

derived: max_redemptions - used_count ^I7piCfeA

Do NOT store this - see the decision note above ^mrRRAdKO

maxAvailable ^DObFnCrV

max_redemptions ^hz3jZpXz

Global redemption cap across all users ^H1c4uyxw

once per user ^axFB9hQe

per_user_limit + unique index ^Fga6WNWi

Enforced by the database, not by an application if ^qbglCfyK

02 ^JEye49Xt

Back-of-envelope ^6grUA8I1

The numbers here exist to prove one point: this is a tiny-write, huge-read system with one very hot row. ^fXj10Rpi

Assumptions ^djt1siEE

- 500k hotels x ~10 room types x 365 sellable dates = ~1.8B inventory rows if you
materialise every date
- Search : booking ratio ~ 1000 : 1.  10k searches/sec -> ~10 bookings/sec
- Peak booking, sale day: ~500 writes/sec ^TC9CIyqT

Quantity ^yaQGALej

Math ^H3OAvYi9

Verdict ^qnzlU77o

Inventory storage ^atdIGZWj

1.8B x ~60 B = ~110 GB (prune past dates, 400-day horizon) ^anTI7qOL

GOOD: one Postgres, partitioned ^hwOr5dN9

Booking write rate ^O1u4c7Th

500/s peak - trivially inside a single primary's capacity ^jpIX94Yk

GOOD: no sharding needed ^yeBtd5q3

Search read rate ^OvOFBV6Z

10k/s, complex filters + geo + ranking ^9jkc8s9m

MID: not Postgres - search index ^5p7F9cyO

Flash-sale promo row ^gmLdXxHS

500 bookings/s all serialising on ONE row ^HUMPMD34

BAD: the real bottleneck ^lPVKjRr0

THE CONCLUSION THIS DRIVES ^u8a4T8Qo

Write volume is small enough that a single Postgres primary handles the entire booking workload - so don't sacrifice transactions for a scale problem you don't have. The two things that actually need engineering are the READ path (search, which leaves the OLTP database entirely) and the HOT PROMO
ROW during a sale, where a single row's lock becomes the throughput ceiling. Section 06 handles the second. ^A40APgZ2

03 ^RjMY6SRK

Which database ^liolq0E4

They asked this directly. The answer is PostgreSQL - and the reasoning matters more than the name. "SQL because it's ACID" and naming the specific invariants sound completely
different. ^wQ991Omm

PostgreSQL as system of record - every hard requirement is a constraint spanning rows ^yJSMAuKc

Requirement ^DvJWT8OI

Postgres feature that enforces it ^nvQetTDc

Never oversell a room ^zPZdgosP

CHECK (booked + held <= total) - the database refuses, even if my query is buggy ^2U7NFteM

Never exceed the promo cap ^Ib3DXwjZ

Guarded UPDATE ... WHERE used_count < max, atomic on one row ^xXKoupTK

Once per user ^RZOimXZe

UNIQUE INDEX (promo_id, user_id) - race-proof by construction ^HWMgI7Po

One booking per user intent ^5UyiiKTi

UNIQUE on the idempotency key ^MFBgnVCE

Rooms + coupon consumed together or not at all ^lDxxhEFi

A single transaction across four tables ^3xyyVp69

Money arithmetic is self-consistent ^9aaBqrhg

CHECK (total = subtotal - discount + tax) ^7hGljRI1

No two bookings for the same physical room ^NIXQYWub

EXCLUDE USING gist on a daterange - Postgres-specific, and exactly this problem ^09i7XTJL

Why not the alternatives - one sentence each ^n66Er0dT

Option ^boN8M5eH

Why not here ^zjpfHen8

MongoDB ^t4PLIA04

It has transactions now, so the old answer is stale. Real objection: my invariants are cross-document uniqueness and
cross-collection atomicity. Mongo makes me implement both in application code - exactly the code that has the race conditions. ^IBXGh7gW

Cassandra / DynamoDB ^0C4MmBDN

Built for write throughput I don't have. Conditional writes are single-partition only, so "decrement promo counter + insert redemption
+ decrement inventory, atomically" isn't expressible. Cassandra LWT = Paxos per op: slow and still not multi-partition. ^eGCM5WfX

Redis as source of truth ^o50T4P2w

Perfect for the HOLD layer (native TTLs) and hot counters. Not durable enough for a paid booking - async replication can lose
acknowledged writes on failover, and that is someone's honeymoon. ^VZIE1Uzb

MySQL ^kRH33sHw

Genuinely fine. I'd pick Postgres for partial indexes, exclusion constraints and richer types, but this design ports directly. ^yKSU3enE

Polyglot: what actually goes where ^m1QbXJIf

Web / mobile clients ^5Y8NjMEo

Booking API ^eKYAwxbC

stateless, Node ^SKbjSlBt

PostgreSQL primary ^SyMnxqGg

hotels, rooms, inventory, bookings, promos,
redemptions, payments, ledger. Partition
inventory by month, bookings by created month ^bELWZa7q

Read replicas ^6jaddFXA

My Trips, availability reads (read-your-writes!) ^I3za2O1g

Redis ^igt2Ape6

room holds with TTL, hot promo counters, session,
price cache, rate limits ^hnWAoEiM

Search API ^6A1bl5Xf

Kafka ^SMb0gmEL

booking / payment events ^zQDjwfbl

Elasticsearch / OpenSearch ^a1pkBpPm

geo, filters, ranking, facets - fed by CDC ^rqAlycky

Consumers ^Hn6c7zL1

email / SMS, hotel partner sync, analytics ^bdg2o5M7

S3 + warehouse ^4QGwAQ88

promo performance, redemption analytics, fraud
signals ^c5Uhg10D

Payment provider ^UfFsKXgy

Stripe / Razorpay - OUTSIDE the DB
transaction ^6dr2WitO

writes ^lt8b6nMG

holds / counters ^Gd5c6hqG

search 10k QPS ^w7NZqvVA

replication ^Wcji2tGV

outbox / CDC ^AysSBCCi

index updates ^PjpkylH6

payment call: separate step, reconciled by webhook ^QV7FqsYG

Store ^flYUEnmc

Holds ^oOo3fsQA

Because ^hIC1pO8s

PostgreSQL ^xZmWT4Da

Hotels, rooms, inventory, bookings, promos, redemptions, payments, ledger ^vqcTfCI9

All the invariants live here. Partition room_inventory by month, bookings by created month ^d7M0oQlp

Elasticsearch / OpenSearch ^jVhqEf7L

Hotel search: geo, filters, ranking, facets ^Fo2al5Cb

10k QPS of fuzzy multi-filter queries would destroy the OLTP primary. Fed by CDC, eventually consistent - fine, search results are advisory ^PBxiBwW7

Redis ^O87XtlnE

Room holds with TTL, hot promo counters, session, price cache, rate limits ^uZBg6CXI

Native expiry and atomic counters; loss is recoverable because Postgres re-derives truth ^BCBFlvi4

Kafka ^JN3dD4NR

Booking / payment events -> email, analytics, hotel partner sync, warehouse ^HS1Xy9OC

Keeps every non-essential consumer off the write path ^1LQ5r5ua

S3 + warehouse ^hr0ai1pp

Promo performance, redemption analytics, fraud signals ^dGiVSnh8

Never run analytics on the booking primary ^qBcsZGJ7

Sharding, when they push ^WD9VFGbs

Shard by hotel_id when the time comes: a booking touches exactly one hotel, so every transaction stays inside one shard. Promo codes are
low-cardinality global config - replicate them everywhere or keep them in a small separate cluster; they don't shard by the same key, and that's fine
because they're read-mostly with a hot-write burst you handle in section 06. ^TSO31amo

THE READ-REPLICA TRAP ^NsE7glVR

Search reads from replicas, bookings write to the primary. So a user who just booked and lands on "My Trips" - served from a replica - sees nothing,
and books again. Fix: read-your-writes. Pin the session to the primary for a few seconds after a write, or pass the write LSN and have the replica
wait for it. Naming this before the interviewer does is worth a lot. ^QKm8RUjD

04 ^E8aIf7Pz

The schema ^7gPOMwSx

Written so that the constraints do the work. Every CHECK and UNIQUE below replaces application code that would otherwise have a race in it. ^ZFQVDAWS

promo_scopes ^5SUoap0W

promo_id        BIGINT FK -> promo_codes
scope_type      HOTEL | CITY | ROOM_TYPE
                | USER_SEGMENT
scope_value     TEXT

PRIMARY KEY (promo_id, scope_type,
             scope_value)

optional: restricts a promo to
specific hotels / cities / room
types / segments ^QScZZWdm

promo_codes ^IIhcCVN1

id              BIGSERIAL PK
code            TEXT
discount_type   PERCENT | FIXED
percent_bps     INT   (1500 = 15.00%)
fixed_amount    BIGINT  minor units
currency        CHAR(3)
max_discount    BIGINT  cap for PERCENT
min_order_value BIGINT  DEFAULT 0
starts_at       TIMESTAMPTZ
ends_at         TIMESTAMPTZ
max_redemptions INT   NULL = unlimited
used_count      INT   DEFAULT 0
per_user_limit  INT   DEFAULT 1
status          ACTIVE|PAUSED|ARCHIVED

CHECK window_valid  ends_at > starts_at
CHECK shape_valid   exactly one of
      percent_bps / fixed_amount set
CHECK amounts_positive, bps <= 10000
CHECK cap_not_exceeded
      used_count <= max_redemptions
UNIQUE (UPPER(code))
      WHERE status <> ARCHIVED ^qUxvm2Wk

promo_redemptions ^5wDU6AWl

id           BIGSERIAL PK
promo_id      BIGINT FK -> promo_codes
user_id       BIGINT
booking_id    BIGINT FK -> bookings
amount_off    BIGINT >= 0
currency      CHAR(3)
use_ordinal   INT DEFAULT 1
status        CONSUMED | REVERTED
created_at / reverted_at

UNIQUE (promo_id, user_id,
        use_ordinal)
  WHERE status = CONSUMED

=> once-per-user, race-proof;
   REVERTED rows free the slot;
   per_user_limit=3 works unchanged ^VXmoNf0n

idempotency_keys ^hegmRsJ6

key           TEXT PK
user_id       BIGINT
endpoint      TEXT
request_hash  TEXT
state         IN_PROGRESS | DONE
status_code   INT
response_body JSONB
created_at / expires_at

INDEX (expires_at)

detects key reuse with a new
body (hash); replays the stored
response byte for byte ^R5Bwpjbx

room_inventory ^kmdd30x6

room_type_id  BIGINT  } PK
stay_date     DATE    } (room_type_id, stay_date)
hotel_id      BIGINT
total_rooms   INT >= 0
booked_rooms  INT >= 0 DEFAULT 0
held_rooms    INT >= 0 DEFAULT 0
price_minor   BIGINT
currency      CHAR(3)

CHECK no_oversell
  booked_rooms + held_rooms <= total_rooms
PARTITION BY RANGE (stay_date)  -- monthly
INDEX (hotel_id, stay_date)
one row per (room type, night); rolling
400-day horizon, nightly job ^iFtKimOF

holds ^wyHieC1o

id            UUID PK
user_id       BIGINT
room_type_id  BIGINT
check_in / check_out  DATE
rooms         INT > 0
quoted_total  BIGINT  (frozen price)
status        ACTIVE | CONSUMED |
              RELEASED | EXPIRED
expires_at    TIMESTAMPTZ

CHECK check_out > check_in
INDEX holds_expiry (expires_at)
  WHERE status = ACTIVE ^6WewjVXM

bookings ^bfQMznZi

id             BIGSERIAL PK
reference      TEXT UNIQUE  BK-8F2K9Q
user_id, hotel_id, room_type_id
hold_id        UUID FK -> holds
check_in / check_out, rooms
currency       CHAR(3)
subtotal_minor / discount_minor /
tax_minor / total_minor
promo_id       BIGINT FK -> promo_codes
status  PENDING_PAYMENT | CONFIRMED |
        CANCELLED | EXPIRED | PAYMENT_FAILED

CHECK money_adds_up
  total = subtotal - discount + tax
CHECK discount_bounded (<= subtotal)
UNIQUE (hold_id) WHERE status IN
  (PENDING_PAYMENT, CONFIRMED) ^QsRczSTI

room_assignments ^eblc5Hzh

(only if the product needs named rooms) ^oZHWagka

OPTIONAL: named physical rooms

room_assignments table +
EXCLUDE USING gist (
  room_id WITH =,
  daterange(check_in, check_out,
            '[)') WITH && )

=> double-booking one physical
   room is impossible at any
   concurrency, no locking code ^KrWi8YrL

N : 1 ^FU4y9QQj

N : 1 ^3ruPPN1G

booking_id ^H4ZDuy0i

hold_id ^PpOeivBc

nights ^1Xj1plEP

bookings.promo_id -> promo_codes ^0am0FGQ1

no FK: key guards POST /bookings ^vPw7vXmO

Every guarantee, and the constraint that enforces it ^ShAAZ0Dt

Constraint ^5Od4iL38

Definition ^eiu5y9aP

What it replaces in application code ^sPGptWo6

no_oversell ^EvaPBFgr

CHECK (booked_rooms + held_rooms <= total_rooms) on room_inventory ^kyXxIL1m

A rule in my service. A buggy deploy, a manual psql session, a bad migration - none can oversell this hotel ^qulq4QvE

promo_once_per_user ^3BllFmBF

UNIQUE (promo_id, user_id, use_ordinal) WHERE status = CONSUMED ^Yay4UIY2

SELECT-then-INSERT check (a check-then-act race). Partial, so a REVERTED redemption frees the slot - a product decision in one line ^TtFhkmgh

cap_not_exceeded ^2nZM9GyF

CHECK (max_redemptions IS NULL OR used_count <= max_redemptions) ^vVXUfwgg

The database itself refuses to let the global cap be exceeded ^GQFEYAOB

shape_valid ^XbXb9JHx

PERCENT => percent_bps set, fixed_amount NULL; FIXED => the reverse ^wXRAtFi2

Validation that the discount form is never half- or double-populated ^NbD43L9y

money_adds_up ^nFQO2YnI

CHECK (total = subtotal - discount + tax); discount_bounded <= subtotal ^gstx5rmQ

The database proves the money arithmetic on every single write ^jPOZEY1g

one_booking_per_hold ^vICKwooO

UNIQUE (hold_id) WHERE status IN (PENDING_PAYMENT, CONFIRMED) ^ka7fT4jn

A second booking attempt on the same hold simply fails ^Foq2UrOc

promo_code_unique ^dViZUZ0G

UNIQUE (UPPER(code)) WHERE status <> ARCHIVED ^Xxi03hKW

Case-insensitive codes; archived codes may be reused ^AtkW3Ghm

EXCLUDE gist ^AGfVx5hr

EXCLUDE USING gist (room_id WITH =, daterange(check_in, check_out, [)) WITH &&) ^6prer0ta

Locking code for named-room double-booking - gone, at any concurrency ^xnVOQWp4

THE LINE TO SAY WHILE YOU DRAW THAT INDEX ^s6d9J8HH

"I'm not going to write SELECT ... WHERE user_id = ? and then INSERT if it's empty - that's a check-then-act race, and under two concurrent
requests both checks pass. I'm putting a unique index on it and letting the INSERT fail. The database does the concurrency control; my code just
handles error 23505." ^UZIHUZ5T

Design details worth narrating ^kavMoNJg

- Money is integer minor units (paise / cents) - never a float.
- Basis points keep percentages integral: 1500 = 15.00%.
- room_inventory is materialised per (room type, night) for a rolling 400-day horizon; partitioned monthly so old months are DROPPED, not deleted.
- Holds freeze the price (quoted_total) for their life; expiry sweeper releases held_rooms.
- The idempotency record is a table with request_hash, state and the stored response. ^IPMm2tqq

05 ^j3ArPEiY

The discount engine ^c7pFx7bn

The LLD half. Two rules keep this clean: validation is an ordered chain of independent predicates, and money is integers - always. ^vahqxr4N

Order of operations ^LggJrXIb

get this wrong and the numbers are wrong ^SfIIoVzU

1  Compute subtotal ^DG6tLrfp

nightly prices x rooms x nights ^PEa6YwaE

2  Check min_order_value ^CIFitKxA

subtotal >= min_order_value - on the PRE-discount amount ^D79bFLj8

3  Raw discount ^nOgg22De

percentage of subtotal, or the flat amount ^OjIXGKul

4  Apply max_discount cap ^KBj9bYdd

min(off, max_discount) ^cdY2iFyv

5  Clamp to subtotal ^dSbsVTUb

discount never exceeds subtotal - no negative totals, ever ^pjKoD7Qx

6  Tax on (subtotal - discount) ^AtLu8oxn

usually; jurisdiction-dependent - say you would confirm ^MgEmhbqP

Chain of responsibility - ordered predicates ^AJUEj1DJ

ORDER decides which message the user sees when several fail ("expired" beats "below minimum" on a
dead coupon) ^Vk9TEOGy

# ^TetYj83W

Rule predicate ^ES483aoA

Reason code ^3iIRLFci

1 ^OgFCW6MA

promo exists ^GL0sNsXX

PROMO_NOT_FOUND ^QyxEJgCw

2 ^HlPsr4U2

status === ACTIVE ^10HaWclu

PROMO_INACTIVE ^E5phqPDX

3 ^4EeTGSlO

now >= startsAt ^isGtv1Wq

PROMO_NOT_STARTED ^HCYNuTA6

4 ^Q1IIYQiU

now < endsAt ^Vszm9mVJ

PROMO_EXPIRED ^K1ktnEoS

5 ^5FKIurvO

maxRedemptions null OR usedCount < max ^xB72DJlA

PROMO_FULLY_REDEEMED ^AkR69rCW

6 ^pXH7Jdih

userUses < perUserLimit ^S7qV4ypH

PROMO_ALREADY_USED_BY_USER ^Iaaiax0d

7 ^YEG8Dk3D

PERCENT, or promo.currency === booking currency ^g0U4hjd5

PROMO_CURRENCY_MISMATCH ^ysXAaqmd

8 ^AWxQdGBe

matchesScope(promo, stay) ^3hwqBfCH

PROMO_NOT_VALID_FOR_THIS_STAY ^iOBBdczK

9 ^659qXlfm

subtotal >= minOrderValue ^vKcnQ7SA

ORDER_BELOW_MINIMUM ^WHQecCcS

Adding a rule later (new-users-only, weekday-only) is one array entry. Validation is pure: no I/O, fully
unit-testable. ^WI6H82Iw

promo/engine.js - pure functions ^JzAk88T5

function computeDiscount(promo, subtotalMinor) {
  let off = promo.discountType === 'PERCENT'
    ? Math.floor((subtotalMinor * promo.percentBps) / 10_000)
    : promo.fixedAmountMinor;
  if (promo.maxDiscountMinor != null)
    off = Math.min(off, promo.maxDiscountMinor);
  // clamp: INR 500 off on INR 300 booking = 300
  return Math.max(0, Math.min(off, subtotalMinor));
}

function quote({promo, subtotalMinor, currency,
                stay, now, userUses, taxBps}) {
  const v = validate({promo, subtotalMinor,
                      currency, stay, now, userUses});
  const discount = v.valid
    ? computeDiscount(promo, subtotalMinor) : 0;
  const taxable = subtotalMinor - discount;
  const tax = Math.round(taxable * taxBps / 10_000);
  return { subtotalMinor, discountMinor: discount,
           taxMinor: tax, totalMinor: taxable + tax,
           promoApplied: v.valid,
           rejectionCode: v.valid ? null : v.reason };
} ^elFoVTcH

ROUNDING POLICY - STATE IT ^5ibQunXr

Math.floor on the discount rounds in the merchant's favour; Math.round on tax matches most
tax authorities. What matters is that the policy is declared and IDENTICAL everywhere - quote,
booking, invoice, refund. If quote floors and booking rounds you get a one-paisa mismatch
finance will find and nobody can explain. ^muhfGDdG

RECOMPUTE, NEVER TRUST ^ME8EDNHF

The client sends {holdId, promoCode}, never {discount: 5000}. The server recomputes the
entire quote at booking time from the frozen hold price. If the client could send a discount
amount, the coupon system is a free-money endpoint. Say this even if nobody asks -
interviewers listen for it. ^WNj8HFcv

MONEY IS ALWAYS INTEGER MINOR UNITS ^aZEngV23

Never a float. 0.1 + 0.2 !== 0.3, and on a booking flow that difference is a support ticket and a
reconciliation break. Percentages are basis points (1500 = 15%); the clamp line is what stops a
negative total from refunding a stranger. ^HPXRRx8i

06 ^WonNIpnn

The three races ^T7zVguxo

The section the question exists to reach. Three independent concurrency problems, three different mechanisms - and none of them is a distributed lock. ^KdtUT2a4

ONE POSTGRES TRANSACTION  -  ALL THREE OR NONE ^1wh3K9rS

1  Inventory ^49aa1ScO

UPDATE ... WHERE free >= n, across every night of the stay ^CV5S2RE7

GUARD: rowcount = nights ^juqIe9zP

backstop: CHECK no_oversell ^mtsQVqxq

2  Per-user limit ^OAxKyX9h

INSERT redemption row - no SELECT first ^3tLrfL6s

GUARD: unique index promo_once_per_user ^1aZtFC6x

error 23505 = already used ^xSRITRgr

3  Global cap  (LAST - it is the hot row) ^BpWFjUUM

UPDATE promo_codes ... WHERE used_count < max RETURNING ^u5Mw9Mpz

GUARD: rowcount = 1 ^LfEjG5aJ

0 rows = exhausted / paused / outside window ^nEILa3bq

ANY GUARD FAILS  ->  ROLLBACK  ->  NOTHING WAS CONSUMED ^iPWLh6j7

no distributed lock  -  no SELECT-then-check  -  no application-level mutex.  The pattern is the same each time: attempt the write conditionally, then check whether it happened. ^rTogRj0e

Race 1 - two users, last room ^pmY71PjV

inventory.sql ^3ZB6NbML

-- take the hold across EVERY night in one statement
UPDATE room_inventory
   SET held_rooms = held_rooms + $rooms
 WHERE room_type_id = $room_type
   AND stay_date >= $check_in
   AND stay_date <  $check_out
   -- [check_in, check_out): no last night
   AND total_rooms - booked_rooms
       - held_rooms >= $rooms;

-- rowcount MUST equal number of nights.
-- Fewer rows updated => ROLLBACK.
-- A partial stay is not a booking. ^OMdq1WbC

DEADLOCK, AND HOW TO NOT HAVE ONE ^ttpwkvy0

Two transactions each updating several inventory rows in different orders will deadlock. Postgres kills
one - correct, but it shows as random 500s under load. Fix: acquire rows in a canonical order - sort by
(room_type_id, stay_date). Within the single ranged UPDATE you get that free from index scan order,
one more reason to prefer one ranged statement over a loop of per-night updates. ^hEEDDQPb

Race 2 - same user, two devices ^HgHQkHiF

redeem.js - let the index decide ^hhl2tKsa

// WRONG - check-then-act. Both read zero,
// both insert, both succeed.
// SELECT 1 FROM promo_redemptions WHERE ...
// if (rowCount === 0) INSERT ...

// RIGHT - attempt the write, let the
// unique index arbitrate.
try {
  await tx.query(INSERT_REDEMPTION, [...]);
} catch (err) {
  if (err.code === '23505' &&
      err.constraint === 'promo_once_per_user')
    throw new PromoError(
      'PROMO_ALREADY_USED_BY_USER', 409);
  throw err;
} ^m7R6gPsX

per_user_limit > 1 ^b9R3QdVm

Try use_ordinal 1..limit until one INSERT succeeds (claimSlot). Bounded by the limit and still fully
race-safe, because each ordinal is its own unique slot. An earlier use makes the slot taken (23505) -
try the next one. ^z0ZGkOn6

Race 3 - the global cap and the hot row ^UvXv7W6B

consume-promo.sql - one atomic statement ^qCL3b080

UPDATE promo_codes
   SET used_count = used_count + 1
 WHERE id = $promo_id
   AND status = 'ACTIVE'
   AND now() BETWEEN starts_at AND ends_at
   AND (max_redemptions IS NULL
        OR used_count < max_redemptions)
RETURNING used_count, max_redemptions;

-- 0 rows: exhausted, paused or outside window.
-- Final guard, not the user-facing validation. ^Fm8iwlnb

THE HOT-ROW PROBLEM - BRING THIS UP YOURSELF ^Ep19kz3K

Every booking using DIWALI20 updates the SAME row. Postgres holds a row lock until commit, so
those transactions serialise. If your transaction holds it 20 ms (because a payment call is inside it), the
coupon caps at ~50 bookings/sec regardless of database size. Fix 1: do the counter update LAST and
keep all network I/O outside - lock window shrinks to microseconds. Fix 2: shard the counter. ^4X7vFuvX

sharded-counter.sql - only when a single row genuinely caps you ^QleSDD8e

CREATE TABLE promo_counter_shards (
  promo_id   BIGINT NOT NULL REFERENCES promo_codes(id),
  shard_no   SMALLINT NOT NULL,
  used_count INT NOT NULL DEFAULT 0,
  max_count  INT NOT NULL,   -- max_redemptions / shard_count
  PRIMARY KEY (promo_id, shard_no),
  CHECK (used_count <= max_count));

-- pick a shard at random so load self-balances
UPDATE promo_counter_shards SET used_count = used_count + 1
 WHERE promo_id = $1 AND shard_no = $2 AND used_count < max_count
RETURNING used_count; ^Qc4t2afT

Sharded counter - state the trade-off out loud ^Ppd64LBk

A request can be told "exhausted" while other shards still have room. Mitigate by retrying 2-3 other shards before giving up. Cost: a small
false-negative rate near the very end of the campaign. Benefit: ~16x the write throughput. Same trick as a hot key in a rate limiter. ^LUrdHfgF

WHY NOT SELECT ... FOR UPDATE? ^k871AjWh

It works and is defensible - but strictly worse: an extra round trip, and the lock is held from the SELECT all the way to COMMIT instead of just for the
UPDATE. The guarded UPDATE ... RETURNING gets the same guarantee in one statement with a shorter lock. Use FOR UPDATE only when you
must read several columns, branch on them in application code, and then write. ^bhlazg8M

07 ^vsFtb1u2

"The user pressed Book twice" ^0OdBlZt1

They asked this specifically. It is not really about double-clicks - the button is the easiest case. It is about every way one intent becomes two requests. ^XsuxNI8U

All the ways it happens - name several, it shows you have shipped ^onKqeDYn

- Impatient double-click, or a double-tap on mobile
- The client HTTP library retries on timeout - the first request succeeded, the response was lost
- A load balancer or proxy retries an idle-timed-out connection
- User refreshes the payment page, or hits Back and re-submits
- The payment provider sends the same webhook twice - they guarantee AT-LEAST-once
- A queue consumer re-processes a message after a crash before its ack ^KDwMeXu7

WRONG ANSWERS, RANKED ^DMKklf87

"Disable the button." A UI nicety, not a guarantee - it does nothing for retries, refreshes or webhooks, and the client is not a trust boundary.
"Use a Redis lock on user_id." Better, but a lock only prevents CONCURRENT duplicates; a retry 5 seconds later sails through.
"Check if a similar booking exists." Check-then-act, so it has the exact race you are trying to fix.
The correct answer: the operation must be IDEMPOTENT, not merely serialised. ^d1GsYyVL

Two identical requests, same Idempotency-Key - one row is the whole mechanism ^DGY00jgx

REQUEST A ^upvuAraR

REQUEST B  (same Idempotency-Key) ^GujptRGD

INSERT key ^eTXsgSjU

OK - IN_PROGRESS ^IyI6CkE2

consume inventory + promo ^IQDUbYkC

guarded UPDATEs + unique index ^YNDr1zUs

write booking + mark key DONE ^BkXyL3rM

same transaction - COMMIT - 201 ^coyRH44w

INSERT key ^pMcqz9Ma

23505 - duplicate key ^XfKRfm6R

read stored response ^9YsLqkx5

200 - same booking replayed ^iaSQivb3

B never creates a second booking - while A is IN_PROGRESS it gets 409 + Retry-After: 1 (never blocks a connection waiting); once A is DONE it replays A's stored response byte for byte. ^dhlctk91

POST /v1/bookings - the complete write path ^kcesIfJX

1  Claim the key ^0zKntLf4

INSERT INTO idempotency_keys (key, user_id,
endpoint, request_hash, state=IN_PROGRESS,
expires_at=+24h) ON CONFLICT (key) DO NOTHING
RETURNING key ^mjAdeJyi

rowCount = 0 ? ^bhWpHIXV

someone already claimed it ^R2arFJe3

request_hash differs  ->  422
IDEMPOTENCY_KEY_REUSED ^hc8EtKMg

client bug, not a retry - refuse loudly ^pEkaWPZw

state = IN_PROGRESS  ->  409 + Retry-After: 1 ^wjDTUfY9

do NOT block a connection waiting on it ^fuBAsITs

state = DONE  ->  replay stored status + body ^9nqOQxPP

byte for byte, same booking ^zKkWBsLs

yes: read prior row ^JRT8rfpk

2  Inside ONE transaction (rowCount = 1) ^bktqyFWd

consumeHold(holdId, userId)          guarded transition ^OsRqLRNf

recomputeQuote(hold, promoCode, user)   from the frozen hold price ^6xQ8OF0f

promo rejected  ->  throw 409 with rejectionCode ^1BN8zetE

insertBooking(PENDING_PAYMENT) ^sxWLRXPh

recordRedemption()      cheap per-user guard first (low contention) ^eWq5swpe

bump promo used_count   hot global counter LAST - shortest lock slice ^HSviX8y8

UPDATE idempotency_keys SET state=DONE, status_code=201,
response_body=...   <- SAME transaction as the booking ^Z4VBM24Q

rowCount = 1: we own it ^mp7cWoJc

3  catch: DELETE FROM idempotency_keys ^cVl8CQtV

a FAILED attempt must free the key or the user can never retry ^eydlC6aG

COMMIT  ->  201 + booking ^6DMMU0cN

any exception: rollback ^5Mr9wMHa

DETAIL 1 - THE IDEMPOTENCY RECORD IS WRITTEN IN THE SAME TRANSACTION AS THE BOOKING ^YyNYItZO

If you commit the booking and then update the key, a crash in that gap makes the retry create a second booking - you have reintroduced the exact
bug. Interviewers probe for this. ^SJwi4qB3

DETAIL 2 - WHERE THE KEY COMES FROM ^qyWlUA5W

If the server generates it, every request gets a new one and it does nothing. It must be generated CLIENT-SIDE, ONCE PER BOOKING INTENT -
when the form opens, not when the button is clicked - so all retries of that intent carry the same value. A double-click then sends the same key twice. ^Pz329ydd

Defence in depth - the layers, in order ^H2CH3Sh9

Layer ^gGtcA6oV

Catches ^5oF3CpYG

Strength ^iRBzadxV

Disabled button + spinner ^uM4MApP7

Impatient clicking ^8efLrTJE

BAD: cosmetic ^mLwkUnoa

Idempotency key ^qLtfj634

Double-click, retries, refresh, webhook replay ^H568Zug4

GOOD: the real mechanism ^dvLPYflI

UNIQUE (hold_id) on bookings ^uwXCp5qB

Two different keys, same hold ^ycRwDBjj

GOOD: structural backstop ^QS3QpPAs

Unique redemption index ^5DHB1K7Y

Double coupon use across devices ^h2nZ8om7

GOOD: structural backstop ^miWbSn51

Provider idempotency key ^Vqwilsy3

Double CHARGE at Stripe / Razorpay ^1g3ivWTH

GOOD: required - pass yours through, derived: booking:{id}:attempt:1 ^lu1semFE

08 ^LiU3B9Fd

API design ^JUElTqQH

The single most important call: quoting is separate from booking. One is a pure read; the other consumes two inventories. Merging them is the design mistake here. ^ErzgV23T

Endpoint ^zKBMroWt

Does ^ZioMsJ73

Notes ^gPFqiVZm

GET /v1/search ^o482kfJY

Hotels by geo + dates + filters ^7o7M0HMX

Served from the search index. Prices advisory, availability approximate ^lxZCaOb7

GET /v1/hotels/{id}/availability ^Az1Gs0ZV

Room types + nightly prices for a date range ^jClV9MVc

Read replica; still not a promise ^Nvuvg4oh

POST /v1/holds ^swtFcVKW

Reserve rooms for ~10 min, freeze the price ^CaXpv5M4

Consumes inventory. Returns holdId + expiresAt ^r2CIFZnr

POST /v1/quotes ^QizAC0cm

Price a hold with an optional promo code ^4B4n42WX

ZERO side effects. Safe to call on every keystroke ^gAs5FAH5

POST /v1/bookings ^IXNc7WUC

Commit: consume hold + promo, create booking ^1RC5NBWR

REQUIRES Idempotency-Key header ^ujuGyDel

POST /v1/bookings/{id}/payment ^dPvgKoem

Attach a payment intent ^IcrMLkrx

Provider idempotency key derived from booking id ^im6AgYm4

POST /v1/webhooks/payments ^wJBoYp3K

Provider confirms or fails ^Cv88LNkx

Must be idempotent - providers replay ^63QjJR2X

DELETE /v1/bookings/{id} ^jMu7TsPz

Cancel; refund per policy; maybe revert the promo ^6Fj0yvVO

Also idempotent ^gKHyM6J4

POST /v1/quotes - request ^v9GG01Iq

{
  "holdId": "5f3c...-ab21",
  "promoCode": "DIWALI20"   // optional; omit for base price
}

// <-- 200, promo valid
{ "currency": "INR", "nights": 3, "rooms": 2,
  "lineItems": [{ "label": "Deluxe King x 2 x 3 nights",
                  "amountMinor": 4200000 }],
  "subtotalMinor": 4200000,   // INR 42,000.00 - integers
  "discountMinor":  840000,   // 20% capped at 10,000 -> 8,400
  "taxMinor":       604800,
  "totalMinor":    3964800,
  "promo": { "code": "DIWALI20", "applied": true,
             "savedMinor": 840000 },
  "holdExpiresAt": "2026-08-24T14:32:10Z" } ^SPyGuDNg

200 - promo REJECTED (still 200, not 4xx) ^et3XWhxR

// The quote itself succeeded; the coupon just does not
// apply. A 4xx would make the client treat a valid
// price as an error.
{ "subtotalMinor": 4200000,
  "discountMinor": 0,
  "totalMinor":    4956000,
  "promo": {
    "code": "DIWALI20",
    "applied": false,
    "rejectionCode": "ORDER_BELOW_MINIMUM",
    "message": "Applies to bookings over INR 50,000"
  } } ^AhpFTiZl

Status codes worth getting right ^h9fN1lqe

Code ^YqOatXwe

When ^BhrgTppd

201 ^NHBeh2iK

Booking created ^TlGzG8px

200 ^FC66NN2o

Idempotent replay of a completed booking - same body as original ^OBu4Skiq

409 ^Z2RRtljb

Hold expired, promo exhausted, price changed, or first attempt still in flight ^3VKtsG2p

410 ^jOonaOpP

Hold expired specifically - client can re-hold silently ^JILvmx7s

422 ^4KeAMuDU

Idempotency key reused with a different body ^zKPpvheD

402 ^dqatEVG3

Payment declined ^ts8i1Vdi

WHY THE QUOTE CAN'T BE TRUSTED AT BOOKING TIME ^x0QoLbbd

Between quote and booking, the coupon can hit its global cap, the user can redeem it in another tab, or the promo can be paused by an admin. So POST /v1/bookings recomputes the quote INSIDE the transaction and compares. If the total changed, return 409 with the new quote and let the user
re-confirm - never silently charge a different amount than the one they saw. ^Sa5846Hd

09 ^Nyd4hXRC

Failure modes & the money saga ^PYSsl94E

The booking transaction is local and safe. The problem is the payment, which lives at a third party and cannot join your transaction. ^s4Q541wb

THE MISTAKE TO AVOID OUT LOUD ^WmhKY76d

Never call the payment provider from inside the database transaction. You would hold a row lock on the promo counter and on every inventory row for the 300-3000 ms the provider takes, and if it times out you do not know whether the charge happened. Booking commits PENDING_PAYMENT first;
payment is a separate step reconciled by webhook. ^1qI4DPVt

The saga, and its compensations ^hFmEkaII

LOCAL + ATOMIC ^nSjhzMij

CROSSES A BOUNDARY - needs saga machinery ^kKK3adMh

1  Hold rooms ^aj2NoRcP

local ^r6e221ID

compensate: release on expiry sweep (every 30 s) ^de1JARIb

2  Book ^q8nfkdLh

inventory + promo + booking row, one local
transaction ^rFnqgrVx

compensate: cancel, restore inventory, revert
redemption ^UK0qLGPD

3  Charge ^18US0b1K

payment provider - third party ^8c2gNHdI

compensate: refund (idempotency key
refund:{bookingId}) ^KZxwQ4rm

4  Confirm on webhook ^jqPRJQs7

terminal state ^nUCmgzSu

duplicate webhook: idempotent handler on provider
event id ^4IgcgK4t

Steps 1, 2 and 4 are local and atomic. Only step 3 crosses a boundary, so only step 3 needs the saga machinery - a reconciliation worker that polls the provider for any booking stuck in PENDING_PAYMENT past its window and drives it to CONFIRMED or CANCELLED. ^cby7sN2v

Failure ^DLXWXQHO

Symptom ^1iZAzR00

Handling ^FAqfhi5k

User abandons the payment page ^UqnPWWlz

Hold never consumed, rooms unsellable ^kfqvbr1P

Expiry sweeper every 30 s: release held_rooms, mark hold EXPIRED. Redis TTL is the fast path, the DB sweep is the truth ^yW1lDokb

Booking created, payment never completes ^tYdOYXhN

PENDING_PAYMENT forever, inventory locked up ^OKC5v2Hs

Reconciliation worker queries the provider by booking reference, then confirms or cancels + compensates ^3Ya9R2Gj

Payment succeeded, our webhook was lost ^sVC84yDX

Charged customer, unconfirmed booking ^uZw6sPFb

Same worker - poll; never trust webhooks as the only path. Always have a pull to match every push ^Lt6xGdvF

Duplicate webhook ^C8EYSf6l

Double confirmation, double email ^R2tuLipc

Idempotent handler keyed on provider event id; state transitions guarded by WHERE status = PENDING_PAYMENT ^ADjk90Gy

Cancellation ^8iVf1OlM

Does the coupon come back? ^KGXFKJqh

Product decision. If yes: redemption -> REVERTED (partial index frees the slot) AND used_count = used_count - 1. If no: leave both. Say which and why ^ILSU7fiR

Promo counter drifts from reality ^kIeqRErs

used_count != COUNT(*) of consumed redemptions ^qi7Pcvnu

Nightly reconciliation job compares and alerts. This is WHY redemptions are a real table and not just a number ^OI8KKCN3

Coupon abuse: many accounts, one person ^qLaSSsFL

Cap burned by one actor ^kpRO46tC

Per-user limit is only the first line. Add device fingerprint, payment instrument, phone-number caps; run as a risk score, not a hard rule ^tgtjMe5H

Admin sets 100% off by mistake ^eOh9ONTy

Free hotel rooms, briefly ^IUWtaKwh

Validate on write (max_discount mandatory above some %), two-person approval above a threshold, cap total campaign liability ^lzqEkEYk

cancel.js - compensation, done idempotently ^1Rtvb6o9

async function cancelBooking(bookingId, { returnCoupon }) {
  await db.transaction(async (tx) => {
    // guarded transition: a 2nd cancel updates 0 rows
    const b = await tx.query(
      `UPDATE bookings SET status = 'CANCELLED'
        WHERE id = $1 AND status IN
          ('PENDING_PAYMENT','CONFIRMED') RETURNING *`);
    if (b.rowCount === 0) return;   // already cancelled
    // restore inventory for [check_in, check_out)
    // UPDATE room_inventory SET booked_rooms = booked_rooms - $1 ...
    if (bk.promo_id && returnCoupon) {
      // CONSUMED -> REVERTED drops the row out of the partial
      // unique index = gives the user their single use back
      // then used_count = used_count - 1 WHERE used_count > 0
    }
  });
  // refund AFTER commit, keyed idempotently - outside the tx
  await payments.refund({ idempotencyKey: `refund:${bookingId}` });
} ^QIuwrXnM

Cancellation rules of thumb ^P0LxsfyE

- Guarded status transition (WHERE status IN ...) makes cancel a no-op the second time.
- Restore inventory over the half-open range [check_in, check_out).
- Returning the coupon is a PRODUCT decision - both steps (REVERTED + used_count - 1) or neither.
- Refund after COMMIT, never inside the transaction, with a derived idempotency key. ^HzKWGTU8

10 ^60wK9dvT

Follow-ups they ask ^hf68auMu

You mentioned there were more questions. These are the ones that follow this setup most often. ^YcjAMDKE

Q  What if two coupons could be combined? ^Jvqzh3hz

Stacking turns a value into a PIPELINE. Give each promo an apply_order and a stackable flag, sort the applicable set, and fold: each promo
computes its discount against the running subtotal. Order changes the answer - 10% then INR 500 off is not INR 500 off then 10% - so the order
must be deterministic and stored, not incidental. Cap total stacked discount as a % of subtotal so a stacking bug cannot zero out a booking, and
consume every promo's counter inside the same transaction. ^RDIVGIgc

Q  How do you generate a million unique coupon codes? ^GdKs2szk

Two different products. SHARED code (DIWALI20): one row, a global cap, the hot-row problem from section 06. UNIQUE per-user codes:
pre-generate offline into a promo_code_instances table, one row per code with max_redemptions = 1 - removes contention entirely at the cost of
storage and a generation job. Use a base32 alphabet with ambiguous characters removed (no O/0, I/1) plus a checksum digit so typos are rejected
client-side without a database hit. ^JJGCJ8io

Q  The hold expires while the user is on the payment page. Now what? ^0MC1qOmE

Return 410 Gone so the client can tell this apart from a generic conflict, and have it silently attempt a re-hold. If rooms are still available the user
never notices. If gone, show it honestly BEFORE payment rather than after. Bonus: a soft grace period - keep inventory reserved 60 s past
expires_at and only release if the sweeper sees no in-flight booking - absorbs a slow payment redirect. ^edwssegf

Q  Prices are dynamic. What if the price changed between quote and booking? ^OJHnDaG7

The hold freezes the price - a large part of what a hold is FOR, alongside inventory. holds.quoted_total is the contract for its lifetime. At booking time
recompute from that frozen price, not live pricing. If the hold expired and re-holding produces a different price, surface the new total and require
explicit re-confirmation. Never charge a total the user did not see. ^ffERfi61

Q  How would you test this? ^CdEYKVWB

Three layers. UNIT: the discount engine is pure functions - cap, minimum, clamping, rounding at boundaries (zero booking, discount > subtotal,
100% coupon). INTEGRATION against a real Postgres: fire N concurrent bookings for a coupon with max_redemptions = 1 and assert exactly one
succeeded - can not be written against a mock. PROPERTY test: for any random sequence of book/cancel, assert used_count == COUNT(*)
WHERE status = CONSUMED and booked + held <= total hold at the end. ^MO39nIIM

Q  Where does search fit - 10k QPS will not hit Postgres ^jKjtJARn

Search leaves the OLTP database entirely: an Elasticsearch (or equivalent) index fed by CDC, holding hotel attributes, geo and a coarse availability
bitmap. Eventually consistent, and that is acceptable because search results are ADVISORY - the authoritative check happens at POST /holds, the
only place that must be correct. The expensive path is approximate, the correct path is cheap and rare. ^V7Ius75E

Q  Multi-region? ^akgM0HD5

Partition by geography, not by replicating writes. Hotels in India are served from an Indian primary; European hotels from an EU primary. A booking
touches one hotel, so it stays in one region - no cross-region transaction is ever needed. Search is global and replicated read-only. Promo codes are
the awkward case: a globally-capped coupon needs regional sub-caps (split-the-quota, as in a distributed rate limiter) or a single owning region for
that promo. Say which and why. ^jusUh9hq

Q  How do you handle the last night of the stay? ^bbMNFHAs

A stay from the 10th to the 13th occupies the nights of the 10th, 11th and 12th - THREE nights, not four. Every range is half-open: stay_date >=
check_in AND stay_date < check_out. An off-by-one silently oversells or under-charges by one night, and reaches production because the tests
used a one-night stay. ^XOmZIcwb

11 ^G49b0CM3

The 45-minute script ^ctEFMvi0

How to pace this specific question, given they asked DB -> schema -> API -> concurrency in that order. ^2ia9N1QM

Minutes ^DjlGwuK7

Do ^X5zdCy5x

Say ^TgYDMbl9

0-4 ^nkKb0Smk

Clarify. Land the "two scarce resources" framing. ^tebQM4CC

"Rooms and coupon redemptions are both inventory. Both can be oversold." ^nW1LQtK0

4-7 ^qKUYKtnM

Numbers, briefly. Show writes are small and search is huge. ^sDd88Yle

"500 bookings/sec peak - one Postgres. So I won't trade away transactions." ^oAXD3rCe

7-12 ^4Et90dZw

DB choice, with the invariant table. ^qxrEMIj2

"Postgres, because every requirement here is a constraint spanning rows." ^KLPLKPgx

12-22 ^1b0TNJ0c

Schema. Write the CHECK and UNIQUE constraints as you go and narrate what each prevents. ^y37p0JQ9

"This unique index IS the once-per-user rule. No application check." ^7VThdrIy

22-28 ^88JirMAm

Discount engine + the API split between quote and book. ^zRUyZDem

"Quoting has no side effects; booking consumes. Never merge them." ^bl6X6585

28-36 ^jNk6BYAT

The three races. Guarded UPDATE, unique index, rowcount checks. ^a65um0Jl

"No distributed lock anywhere. The WHERE clause is the lock." ^toRIldlW

36-41 ^ABHpZFKl

Double-submit: idempotency key, in the same transaction. ^bre7Bl28

"The key comes from the client, once per intent. That's what makes retries free." ^pHVPFpOn

41-45 ^sr6Gu4GR

Failure: the payment saga, the reconciliation worker, cancellation. ^3BzlD7Fb

"Never call the payment provider inside the transaction." ^0ZjKDCmP

Six sentences that carry this round ^mXQsQSfk

1.  "There are two scarce resources here - rooms and redemptions - and a booking consumes both atomically or neither."
2.  "Postgres, because my invariants are cross-row constraints and it enforces them declaratively; anywhere else I'd hand-roll them and the
hand-rolled version is where the race lives."
3.  "Store used_count and the cap separately, not a remaining counter - so the cap can change without racing consumption, and the count stays
auditable."
4.  "I won't SELECT then check. I'll attempt a guarded UPDATE and look at the rowcount - that's atomic in one statement."
5.  "Double-click is just the visible case of duplicate delivery. The fix is idempotency, and the key has to be client-generated per intent."
6.  "The promo row is hot during a sale. I keep all network I/O out of the transaction, and if that's not enough, I shard the counter." ^kOeWIhtd

WHAT THEY WERE PROBABLY TESTING ^m2uqg23O

This question has a specific shape: it looks like a schema question, and it is actually a concurrency question wearing a schema's clothes. Every field
they listed - expiry, max discount, currentAvailable, once per user - is a CONSTRAINT, and the interesting part of each one is what happens when
two requests hit it at the same instant. If you spent the round drawing tables and never said the word "atomic", that is the gap worth closing. ^2NXaOGTP

%%
## Drawing
```compressed-json
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

UPxUAnoOQLJmGnbagLkdak4cd+p+DnySHzgtYYkOWQ5ymmUOWo61DlsOnQ5DqwMOTVZzDne9qw5glltWQJZYFmc8Fw5HCmz6W0Zsin4WYI50jmT6e/AIjmUfEIZCiQKAOI55HySOfvpMjkNGX3J8jn78cw57CmdqT6J6jkpOdY52jmkWbo52TkBWXYpxjkumM7A61kWOetZJznXLHY5tyyOOYBJZvrOOceMGbb8PO458HGeOTM5KvrKAi8YfjmYA

AE5izlBOTHAITmW+v855/GxCVE5XDoAKXE5jQAJOUk5GjmPOeksGTklLFk5OTkR8Y/mR9ljmSfZdokqabzJdCn8yXmpWDlrxDU5EGnLLPU5hDlNOaQ55DlkGdYZjQHRGV05XCnaWb05ysn9OXXJgzmNwO1ZIzmcOa82PDnXEJM5C+lhOUs58zmAuc5cYjkEQGs5cznuiEMZmznyccS5CjkqcUo5HCkEWSi5xzlaOX6J3MpYuZc5hjnJLAvINzlmO

fRZm1mRWQ852rnpLM85DjmgKW85N1wfOa453zlwAB45IfpQuWQCIfo+OQ284foguXa5krnWCY2AwTmhOdC5ETlX6XC5xAC9rAi5mEnxOfBxiTnXRMk5aBpouTRAGLnnOdi5oVb4ADvc5jCVNHok+0pQwGiezpgyfun2RSmqSPRJOpnfaUIYMNmNocnwgjD0kIkxtXFXMWaZQdmksan+GW5CQFfwiwBLqFUA8jL6cFUA56RCQM2pHqqQcOiZlCyYm

b20Yag+qEyBemK+qOFSs5zEmSxUKRiyfkxS3YCLKcsp184nAGspGymVNIKZww65QDspm2HIOfIcOiZSmUl+aIZntFUANaTSDiVAN9IlQEtCjFL8gFV4BlJloUlJpxHlWMW59dnsMB7ZHGTEHr1h1bmA6RZ+tIBjAOFWWrZZmX6+jbkWmU1x0C6K3G25HblduSKivbn9uUyAg7mXmbSSo97fAh4+eJkwsL64pnQDoazJCI4bYenexOnxgmghR7lnQ

WiG4CQ+eF561XBkqa6prtlR6A3ZXPLUqWbq6Zk54RTR5J6mmV/ZPEk/2d3ZoB6tuXyY0Hl1AN25cHlIXAh5m4HK9AsAVfLY6VDOaojaYjQKCDmL2Ug5QZnp6RkBZKZYQCJxYNoBRPk5zGFfSZQxP0niITMBynlwQKp5s3Lm/oap3LIqSqOZ2aEEuQ6RenlMwQZ5l7ERmbvabAAMrosCygB8IRk2WYDUedQmbtmXWvB665Tn0QjgEc5nPt3SbP4l8

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=
```
%%