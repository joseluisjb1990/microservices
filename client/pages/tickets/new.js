import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const NewTicket  = () => {
  const [title, setTitle] = React.useState('');
  const [price, setPrice] = React.useState(0);
  const {doRequest, errors} = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price
    },
    onSuccess: () => Router.push('/'),
  });


  const onBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  }

  const onSubmit = (event) => {
    event.preventDefault();

    doRequest();
  }

  return (
    <div>
      <h1>New Ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input className="form-control" value={title} onChange={e => setTitle(e.target.value) }/>
        </div>
        <div className="form-group">
          <label>Price</label>
          <input onBlur={onBlur} className="form-control" value={price} onChange={e => setPrice(e.target.value) } type="number"/>
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
}

export default NewTicket;
