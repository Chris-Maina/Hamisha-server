
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
