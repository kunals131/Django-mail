document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function submit_email() {

    // Post email to API route
    fetch('/emails' , {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => load_mailbox('sent'));
    return false;

  }


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-form').onsubmit = submit_email;

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



function load_mail(id){
//getting that mail

fetch('/emails/' + id)
.then(response => response.json())
.then(email => {
    
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
     
    //displaying email
    const view = document.querySelector('#email-view');
    view.innerHTML = `
    <ul class="list-group">
  <li class="list-group-item"><b>From : </b> <span>${email['sender']}</span></li>
  <li class="list-group-item"><b>To : </b> <span>${email['recipients']}</span></li>
  <li class="list-group-item"><b>Subject : </b> <span>${email['subject']}</span></li>
  <li class="list-group-item"><b>TimeStamp : </b> <span>${email['timestamp']}</span></li>
    </ul>
    <div class="card mb-3" style="width: 40rem;">
    <div class="card-body">
    <h5 class="card-title">Body</h5>
    <h6 class="card-subtitle mb-2 text-muted">Read : </h6>
    <p class="card-text">${email['body']}</p>
    </div>
    </div>
`;
    //create reply button
    const reply = document.createElement('button');
    reply.className = "btn btn-primary"
    reply.innerHTML = "Reply";
    reply.addEventListener('click', function(){
        compose_email();

        document.querySelector('#compose-recipients').value = email['sender'];
        let subject = "Re : " + email['subject'];
        document.querySelector('#compose-subject').value = subject;

        let body = `
        On ${email['timestamp']}, ${email['sender']} wrote : ${email['body']}`;
        document.querySelector('#compose-body').value = body;

    });
    view.appendChild(reply);

    //creating the archive button in the dom
    const archive = document.createElement('button');
    archive.className = "btn btn-primary mx-2   ";
    if (email['archived']) {
        archive.innerHTML = "Unarchive";
    }
    else {
        archive.innerHTML = "Archive";
    }
    archive.addEventListener('click', function(){
        fetch('/emails/'+email['id'], {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email['archived']
            })
          }).then(response=>load_mailbox('inbox'))
    })
    view.appendChild(archive);

    //read and unread button

    const readButton = document.createElement('button');
    readButton.className = "btn btn-primary";
    readButton.innerHTML = "Mark as unread";
    readButton.addEventListener('click', function() {
        fetch('/emails/'+email['id'], {
            method: 'PUT',
            body: JSON.stringify({
                read : false
            })
          })
          .then(response=>load_mailbox('inbox'))
    })
    view.appendChild(readButton);

    //mark as read
    if (!email['read']){
        fetch('/emails/'+email['id'], {
            method: 'PUT',
            body: JSON.stringify({
                read : true
            })
          })
    }
});
}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  const view = document.querySelector('#emails-view');
  // Show the mailbox name
  view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //displaying emails
  fetch('/emails/' + mailbox)
.then(response => response.json())
.then(emails => {

    emails.forEach(email => {
        
        let div = document.createElement('div');
        if (email['read']) {
            div.className = "email-list-item-read";
        }
        else {
            div.className = "email-list-item-unread";
        }
        div.innerHTML = `
            <span class="sender col-3"> <b>${email['sender']}</b> </span>
            <span class="subject col-6"> ${email['subject']} </span>
            <span class="timestamp col-3"> ${email['timestamp']} </span>`;

        div.addEventListener('click', ()=> load_mail(email['id']));
        view.appendChild(div);

    });

    // ... do something else with emails ...
});
}