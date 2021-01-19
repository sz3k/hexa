import { useMemo } from 'react'
import useWyreIntegrationState from '../state-selectors/accounts/UseWyreIntegrationState'

export default function useWyreOrderWidgetHTML() {
  const { wyreReservationCode } = useWyreIntegrationState()

  return useMemo( () => {
    return `
      <html>
  <head>
      <title>Wyre widget</title>
  </head>
  <body>
      <div id="wyre-dropin-widget-container"></div>

    <script src="https://verify.sendwyre.com/js/verify-module-init-beta.js"></script>
      <script type="text/javascript">

          function sendPostMessage(payload) {
            window.ReactNativeWebView.postMessage(payload);
          }

          window.addEventListener('message', function(event) {
            console.log("Message received from RN: ", event.data)
          }, false);


          (function() {
              // debit card popup
              var widget = new Wyre({
                  env: 'test',
                  reservation: '${wyreReservationCode}',
                  operation: {
                      type: 'debitcard-hosted'
                  }
              });

              widget.on("paymentSuccess", function (event) {
                  console.log("paymentSuccess", event );
                  sendPostMessage(event);
              });

              widget.on('ready', (e) => {
                console.log("ready", e);
                sendPostMessage(e);
              });

              widget.on("exit", (e) => {
                console.log("exit", e);
                sendPostMessage(e);
              });
          })();
      </script>
  </body>
  </html>
      `
  }, [ wyreReservationCode ] )
}
