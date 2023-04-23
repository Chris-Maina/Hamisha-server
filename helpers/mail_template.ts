
export const getMailTemplate = ({ title, firstName, text } : { title: string, firstName: string, text: string}) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Bebataka Email Template</title>
        <style>
          .container {
            width: 100%;
            height: 100%;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email {
            width: 80%;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
          }
          .email-header {
            background-color: #333;
            color: #fff;
            padding: 10px;
            text-align: center;
          }
          .email-body {
            padding: 20px;
          }
          .email-footer {
            background-color: #333;
            color: #fff;
            padding: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email">
            <div class="email-header">
              <h1>${title}</h1>
            </div>
            <div class="email-body">
              <p>Hello ${firstName},</p>
              <p>${text}</p>
              <p>Take care of your gargbage ☘️,</p>
              <p>Bebataka</p>
            </div>
            <div class="email-footer">
              <p>Visit <a href="https://www.bebataka.co.ke/">bebatak.co.ke</a> for more.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}


export const getCustomerIntroMailTemplate = ({ firstName }: { firstName: string}) => {
  return `
     <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bebataka Email Template</title>
          <style>
            .container {
              background-color: #f9fafb;
              color: #000F08;
            }

            .header {
              text-align: center;
            }

            .logo {
              text-decoration: none;
              font-size: 16px;
              font-weight: bold; 
              margin-bottom: 32px;
              display: inline-block;
              letter-spacing: 0.1px;
              color: #000F08;
            }

            .favicon {
              height:25px;
              margin-bottom:-5px;
              margin-right: 3px;
            }

            .emoji {
              font-size: 22px;
            }

            .title {
              font-size: 32px;
              color: #FFBA08;
              margin: 0;
              margin-bottom: 10px;
              text-align: center;
            }
            .subtitle {
              font-size: 22px;
              margin: 0 auto;
              text-align: center;
              margin-bottom: 89px;
            }
            .text {
              font-weight: 600;
              letter-spacing: 0.1px;
            }

            .table {
              margin: 0 auto;
            }

            section {
              width: 746px;
              border-radius: 4px;
              border: solid 1px rgba(0, 0, 0, 0.1);
              background-color: #ffffff;
              padding: 25px 30px;
              margin-bottom: 35px;
            }

            .text-button {
              color: #FFBA08;
            }

            .text-button {
              height: 15px;
              width: 100px;
              background-color: #FFBA08;
              border-radius: 4px;
              color: #000F08;
              font-size: 13px;
              font-weight: bold;
              letter-spacing: 0.5px;
              display: inline-block;
              text-align: center;
              vertical-align: middle;
              padding: 4px 0;
              margin: 0 auto;
            }

            .button {
              cursor: pointer;
              text-decoration: none;
              height: 50px;
              width: 196px;
              line-height: 50px;
              text-align: center;
              background-color: #FFBA08;
              border-radius: 4px;
              outline: none !important;
              color: #000F08;
              font-size: 13px;
              font-weight: bold;
              letter-spacing: 0.5px;
              margin-bottom: 28px;
              display: block;
            }

            .button-wrapper > .button{
              margin-left: auto;
              margin-right: auto;
            }

            .button-wrapper > a {
              text-decoration: none;
            }

            @media screen and (max-width: 600px) {
              .title {
                font-size: 28px;
              }
              .subtitle {
                font-size: 20px;
              }
              section {
                width: 300px;
                padding: 10px;
              }
            }

            @media (min-width: 600px) and (max-width: 960px) {
              section {
                width: 546px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
              <div class="header">
                <a href="https://www.bebataka.co.ke/" class="logo">
                  <span>
                    <img class="favicon" src="https://www.bebataka.co.ke//favicon.ico">
                    Bebataka
                  </span>
                </a>
              </div>

              <h3 class='title text'>Hello <span class='text emoji' role="image" aria-label="raised hand">👋</span>&nbsp;${firstName},</h3>
              <h4 class='subtitle text'>Welcome to Bebataka</h4>

              <table class="table">
                <tbody>
                  <tr>
                    <td>
                      <section>
                        <p>Thank you for registering with us. To get you up to speed here is how to create, pay and mark your garbage collection contract as complete</p>
                        <ol>
                          <li>Create a request using <span class="text-button">Get collector</span> button. Enter the location, number of house units, day and date when the garbage will be collected </li>
                          <li>
                            Wait for gargbage collectors to post their garbage collection price proposals.
                          </li>
                          <li>Accept/reject the proposals. Take a look at the proposals shared. You can also check out the garbage collector details by clicking their name. Take note of their name, phone number, jobs completed and vehicle.
                            Accept the price proposal within your budget.</li>
                          <li>
                            View the contract automatically created after accepting a proposal. Take not of the contract and payment status. The contract status will be "Draft" and payment "Funds unavailable".
                          </li>
                          <li>Pay. Click on the <span class="text-button">Pay</span> button. This will initiate MPESA payment on the number you registered with. Once paid and you receive an MPESA message, the contract and payment status will change. They will be "Active" and "Funds available". We will hold the payment until garbage is collected</li>
                          <li>Gargabe collector will be tasked with collecting your taka taka </li>
                          <li>Once collected, you can confirm and mark the contract as complete using <span class="text-button">Complete</span> button. This will initiate a payment to the garbage collector.</li>
                        </ol>

                        <p>Hurray! You are taka taka will have been sorted.</p>
                        <p>Feel free to send us an e-mail at <a href="mailto:chris.maina@bebataka.co.ke ">
                            chris.maina@bebataka.co.ke
                          </a> any point incase something goes wrong</p>
                      </section>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="button-wrapper">
                        <a class="button" href="https://www.bebataka.co.ke/">Go to website</a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
        </body>
      </html>
     </html>
  `;
}
