export const getPremiumTemplate = (otp, name, title, actionMessage, color) => {
  return `
    <div style="margin:0; padding:0; background-color:#050508; font-family:'Courier New', Courier, monospace; color:#e5e2e1;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background-color:#0b0b0f; border:1px solid rgba(255,255,255,0.08); border-radius:16px; overflow:hidden; box-shadow:0 12px 40px rgba(157,0,255,0.15);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg, #120e25 0%, #06050b 100%); padding:30px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.05);">
            <h1 style="margin:0; font-size:26px; font-weight:800; letter-spacing:3px; color:${color}; text-transform:uppercase;">⚔️ BATTLECODE</h1>
            <p style="margin:5px 0 0; font-size:10px; color:#888; letter-spacing:4px; text-transform:uppercase;">MULTIPLAYER ECOSYSTEM</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 30px;">
            <h2 style="margin:0 0 20px; font-size:20px; color:#ffffff; text-transform:uppercase; letter-spacing:1px;">
              ${title}
            </h2>

            <p style="margin:0 0 15px; font-size:14px; color:#a5a2a1; line-height:1.6;">
              Hi <strong>${name}</strong>,
            </p>

            <p style="margin:0 0 25px; font-size:14px; color:#a5a2a1; line-height:1.6;">
              ${actionMessage}
            </p>

            <!-- OTP Code Box -->
            <div style="text-align:center; margin:35px 0;">
              <div style="display:inline-block; padding:18px 36px; font-size:32px; letter-spacing:8px; font-weight:bold; color:${color}; background-color:#121218; border:1px solid ${color}40; border-radius:12px; box-shadow:0 0 20px ${color}15;">
                ${otp}
              </div>
            </div>

            <p style="margin:0 0 15px; font-size:13px; color:#888; line-height:1.6;">
              This system verification key is valid for exactly <strong>10 minutes</strong>. If you did not request this transaction, please disregard this email.
            </p>

            <hr style="border:none; border-top:1px solid rgba(255,255,255,0.08); margin:30px 0;" />
            
            <p style="margin:0; font-size:11px; color:#555; text-align:center; letter-spacing:1px;">
              [AUTOMATED TRANSPORTS] DO NOT REPLY TO THIS ADDRESS.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
};
