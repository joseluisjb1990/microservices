import Link from 'next/link';
import buildClient from '../api/build-client';

const LandingPage = ({ currentUser, tickets }) => {
  console.log('Landing page running...');
  const ticketList = tickets && tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}><a>View</a></Link>
        </td>
      </tr>
    )
  })
  return (
    <div>
      <h1>tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  )
}


LandingPage.getInitialProps = async (contex, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { currentUser, tickets: data };
}

export default LandingPage;
