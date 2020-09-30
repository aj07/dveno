import 'regenerator-runtime/runtime'
import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Big from 'big.js'

const SUGGESTED_DONATION = '0'
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed()

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    contract.getMessages().then(setMessages)
  }, [])

  const onSubmit = useCallback(e => {
    e.preventDefault()

    const { fieldset, message, donation } = e.target.elements

    fieldset.disabled = true

    // TODO: optimistically update page with new message,
    // update blockchain data in background
    // add uuid to each message, so we know which one is already known
    contract.addMessage(
      { text: message.value },
      BOATLOAD_OF_GAS,
      Big(donation.value || '0').times(10 ** 24).toFixed()
    ).then(() => {
      contract.getMessages().then(messages => {
        setMessages(messages)

        message.value = ''
        donation.value = SUGGESTED_DONATION
        fieldset.disabled = false
        message.focus()
      })
    })
  }, [contract])

  const signIn = useCallback(() => {
    wallet.requestSignIn(
      nearConfig.contractName,
      'DVENO'
    )
  }, [])

  const signOut = useCallback(() => {
    wallet.signOut()
    window.location.replace(window.location.origin + window.location.pathname)
  }, [])

  return (
    <main>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1>DVENO: Decentralised Venmo</h1>
        {currentUser
          ? <button onClick={signOut}>Log out</button>
          : <button onClick={signIn}>Log in</button>
        }
      </header>
      {currentUser ? (
        <form onSubmit={onSubmit}>
          <fieldset id="fieldset">
            <p><h2>Name: <b>{ currentUser.accountId }</b></h2><br></br><p></p>
            You can add/settle up the expenses.</p>
            <p>Add the expenses from , { currentUser.accountId }!</p>
            <p className="highlight">
              <label htmlFor="message">Name, Reason of expenses, Amount</label>
              <input
                autoComplete="off"
                autoFocus
                id="message"
                required
              />
            </p>
<br></br>
<h4>You can lock up the amount for sending to your friend for next trip.
 It will be automatically Settled while doing the next payment.</h4>
            <p>
              <label htmlFor="donation">Amount :</label>
              <input
                autoComplete="off"
                defaultValue={SUGGESTED_DONATION}
                id="donation"
                max={Big(currentUser.balance).div(10 ** 24)}
                min="0"
                step="0.01"
                type="number"
              />
              <span title="NEAR Tokens">Ⓝ</span>
            </p>
            <button type="submit">
              Lock            </button>
          </fieldset>
        </form>
      ) : (
        <>
          <br></br>
          <p><br></br>
          <h2>'Want to go on a trip to the Bali with friends? Difficult to track all 
          the small expenses.'</h2>
          <p><br></br>
          <b>DVENO</b> is an app for tracking bill record, splitting and do advance/recurring payment. It lets you and your friends add various bills and keep track of who owes who, and then it helps you to settle up with each other.
          </p>
          If you want to settle payment for next trip, you can lock up that payment too. :)
          </p>
          <br></br>
          <p>
           <h3> Go ahead and sign in to try it out! and say goodbye to Venmo.</h3>
          </p>
        </>
      )}
      {!!currentUser && !!messages.length && (
        <>
          <h2>LedgerBook (Past txn)</h2>
          {messages.map((message, i) =>
            // TODO: format as cards, add timestamp
            <p key={i} className={message.premium ? 'is-premium' : ''}>
              <strong>{message.sender}</strong>:<br/>
              {message.text}
            </p>
          )}
          <h2>LedgerBook for Settled txn (Coming Soon)</h2>
         
        </>
      )}
    </main>
  )
}

App.propTypes = {
  contract: PropTypes.shape({
    addMessage: PropTypes.func.isRequired,
    getMessages: PropTypes.func.isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
}

export default App
