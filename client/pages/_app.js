import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
        <div className="container">
          <Component {...pageProps} currentUser={currentUser} />
        </div>
    </div>
  )
}

AppComponent.getInitialProps = async (appContext) => {
  let pageProps = {};
  let data;
  const client = buildClient(appContext.ctx);
  try {
    data = (await client.get('/api/users/currentuser')).data;
  } catch (e) {
  }


  if (appContext.Component.getInitialProps) {
    try {
      pageProps = await appContext.Component.getInitialProps(
        appContext.ctx,
        client,
        data.currentUser
      );
    } catch(e) {
      console.error(e);
      pageProps = {};
    }
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;
