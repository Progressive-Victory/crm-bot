<div>
  <table style="width: 100%; border: none;" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td><a href="https://progressivevictory.win/"><img src="https://github.com/Progressive-Victory/crm-bot/blob/main/assets/badge.png" width="200" alt="progressive victory banner" /></a></td>
    <td rowspan="3">        Interval PVBot. Responsible for server utilities and metrics and the server-join action from filling the form
</td>
  </tr>
</table>
  <h2>
    Setup
  </h2>
  <ol>
    <li><code>CLIENT_ID</code>, <code>TOKEN</code> are discord bot credentials. There's a simple guide available <a href="https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot">here</a> to accomplish this.</li>
    <li><code>TEST_GUILD</code> is the guild ID for testing purposes, for slash commands to only appear in that server. This is an optional variable.</li>
    <li><code>OWNERS</code> is a comma separated list of user IDs that should have administrator access to the bot.</li>
    <li><code>TRACKING_GUILD</code> is the guild ID for the server that should listen to member activity for the CRM database. For testing purposes, this would probably be equivalent to whatever you'd set in <code>TEST_GUILD</code>.</li>
    <li><code>TRACKING_CHANNEL</code> is the logs channel ID, this needs to be a channel that only permits automated system join messages. Those are the kinds of messages you'll see with sticker prompts when someone joins, basically.</li>
    <li><code>API_AUTH</code> is the authorization token from <a href="https://github.com/Progressive-Victory/crm-backend/blob/main/.env.sample">this repo</a>, and <code>API_ENDPOINT</code> should match the host for that project. You can leave them both as default if you haven't changed anything there.</li>
    <li>The default for <code>DB_URI</code> is <code>mongodb://localhost:27017</code>, change as your settings are configured</li>
  </ol>
  <h2>
    Running
  </h2>
  <p>
    Run <code>yarn dev</code>
  </p>
  <h2>
    More Reading
  </h2>
  <p>
    For information on how the code works and a more detailed setup guide, refer to the following <a href="https://grateful-touch-3e3.notion.site/PVBot-Backend-Setup-f86aa59ff4664f548a0ca232083f7e7e">setup guide</a>.
  </p>
  <p>
    When considering contributing, refer to <a href="https://www.github.com/Progressive-Victory/crm-bot/blob/main/.github/CONTRIBUTING.md">the contributing file</a>!
  </p>
</div>
