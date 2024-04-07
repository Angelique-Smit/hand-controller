AI CONTROLLER:

Explanation:
  This repo is split up in 3 different sections, a setup section, a test section and a final project section.

  set-up:
    In the set-up section you can save poses with a certain label and download them. This will be the training/test data. I have personally used about 50-400 examples for each pose (I reccommend somewhere around 200-250) in your training and test data. 
    Make sure to not use the same file for both testing/training purposes.

  Test:
    In the test directory you can train the actual machine with your training data. If you want to use your own posedata, simply replace the trainingdata.json file with your own.
    You can also test it on accuracy, with my own training data I usually get models that avg around 95%-100% correct. There is a pdf in this file that talks about how certain settings affected the accuracy and what I did to make the accuracy higher.
    You have the oppertunity to try individual tests live from your webcam too.
    At last you can save the model and it will download 3 files to your computer (model.json, model.meta.json and model.weights.bin)

  Final project:
    I used the simple set-up code for CLE4 from the CMGT HR repo and editted this to make the fish move based on what the model predicts.
    Originally I wanted to do this with a mario bross 1-1 clone but the 2 Git repo's I managed to find could not be used due to technical reasons (ex: one of them refused to load getUserMedia())
    
    You can take the same principle and apply it to any game you want. Just look in fish.js how the import is handled and you van apply it to your own projects.

    I give anyone full premission to use my code for any reason whatsoever, monetize it if you want, I really couldn't care less. I wrote this code in 3 and a half days so goodluck spitting it out. 

INSTALLATION GUIDE:
  Download this code and unzip it.
  Boot up your IDE of choise and open up your terminal
  run the following:
      cd eindproject
      npm install

  Now that it is installed, you can run:
      npm run dev

  Which will give you a localhost link. Open this up and you can try it out yourself. The other files do not require any npm installs, they are pure JS.

  You can also try it out on github pages here:
  
