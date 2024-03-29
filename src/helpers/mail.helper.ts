const generateHTML = (email: string, name: string, message: string): string => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <link rel="preconnect" href="https://api.fontshare.com" crossorigin>
          <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap" rel="stylesheet">
          <style>
         * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
  
            html,
            body {
              width: 100%;
              height: 100%;
              min-width: toRem(280);
              background-color:  #191c1f;
              font-family: "Satoshi", sans-serif;
              font-weight: 400;
              color: #fff;
            }
  
            main {
              padding: 1rem;
              display: flex;
              flex-direction: column;
              gap: 2rem
            }
  
            h2 {
              font-size: 2rem;
                margin-bottom: 3rem;
            }
  
            p {
              font-size: 1rem;
            }
  
            span {
              font-size: 1.2rem;
              font-weight: bold
            }
  
            @media screen and (min-width: 42rem) {
              main {
                padding: 4rem;
              }
              p {
              font-size: 1.2rem;
            }
  
            span {
              font-size: 1.5rem;
              font-weight: bold
            }
            }
  
            @media screen and (min-width: 42rem) {
              main {
                padding: 4rem 8rem;
              }
            }
          </style>
        </head>
        <body>
            <main>  
              
              <h2>From Your Portfolio</h2>
              
              <p><span>Email:</span> ${email}</p>
        
              <p><span>Name:</span> ${name}</p> 
                
              
              <p><span>Message:</span> ${message}</p>
            </main>
        </body>
        </html>
        `;
};

export default generateHTML;
