import debug from 'debug';
import axios from 'axios';

debug.enable('that:*');

const dlog = debug('that:us:api:checkin');

const checkinslug = process.env.CHECKIN_SLUG || 'pmRx6nSzJo7X0mVRxtd0Zyg';
const titocheckinbase = `https://checkin.tito.io/checkin_lists/${checkinslug}/`;

// ?reference='DMUQ-1'
// Verification RegEx: /^[a-zA-Z0-9]{4}-[0-9]/
export default async function checkin(req, res) {
  dlog('query vars sent %O', req.query);

  const { reference } = req.query;
  dlog('q reference', reference);
  if (!reference) {
    dlog('no reference sent');
    return res.status(404).json({});
  }

  const { data } = await axios.get(`${titocheckinbase}tickets`);
  const tickets = data;
  dlog('ticket count', tickets.length);
  const record = tickets.filter(
    (t) => t.reference.toLowerCase() === reference.toLowerCase(),
  );
  dlog('ticket record filtered: %O', record);
  if (record.length === 0) {
    dlog('no ticket found');
    return res.status(404).json({});
  }
  if (record.length > 1) {
    dlog(
      'multiple tickets found, was registration reference provided instead of ticket reference?',
    );
    return res.status(406).json({
      message:
        'multiple tickets found, was registration reference provided instead of ticket reference?',
    });
  }

  const payload = {
    checkin: {
      ticket_id: record[0].id,
    },
  };

  const options = {
    method: 'POST',
    url: `${titocheckinbase}checkins`,
    // headers: {
    //   'Content-Type': 'application/json',
    //   Accept: 'application/json',
    // },
    data: payload,
  };

  const result = await axios(options);
  dlog('checking result %d, %O', result.status, result.data);

  if (result.status === 200 && record[0].id !== result.data.ticket_id)
    return res.status(502).json({ message: 'checking at tito failed' });

  return res.status(200).json(result.data);
}
