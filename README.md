# miPI

miPI let you to interconnect multiple midi devices to a Raspberry PI and use it as midi thru/midi merge box. You can assign devices through a simple web interface. 

Configuration will be saved automatically and loaded on startup.

### Installation

Install ```alsa-utils``` ```nodejs``` and ```npm``` via apt-get
```sh
$ sudo apt-get install alsa-utils nodejs npm -y
```

Clone repository 
```sh
$ cd $HOME
$ git clone https://github.com/minux84/mipi.git
```

Install the dependencies and start the server.

```sh
$ cd mipi
$ npm install
$ node mipi
```

You should view ```Server started. Listening on http://YOUR_IP:3000``` now open your favourite browser and connect to your Raspberry :) 

In your browser you should see something like this:
![miPI](https://github.com/minux84/mipi/blob/master/screenshot.png?raw=true)

Simply drag devices in SEND or RECEIVE list!

If you want to start miPI at boot, edit ```/etc/rc.local``` file and add this line
```sh
node $HOME/mipi/mipi.js &
```
just before 
```sh
exit 0
```

License
----
MIT
