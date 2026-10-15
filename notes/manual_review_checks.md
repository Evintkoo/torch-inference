### Torch Inference Manual Review

This is a Manual Review by Evint Leovonzko for this codebases and notes of this github repository. The main goal of having this is to start moving from the research and development to actually ships the product and make it ready to be used, marketted, and published publicly.

## principles

1. Deployment is alwasy self sustain and self maintain, deploy it once, it serve itself without any human need to notice and manual fix any time
2. app shall be optimized and both lightweight for the user to have the compiled and for the developer need to be also fast to compile so that it wont making a CI CD pipeline very long 
3. app shall be able and compatible in any machine, including the old and deprecated machine, while keeping the best performance and throughput
4. the point of having this app is to make this app is simple to use for non developer, easy to set up for an devops engineer, and easy to customize for a developer
5. this repository should be human maintanable and readability need to be high, and agents need to follow the conventions 100$ with a dedicated and pattern that is set up properly so that every output from the agent is easy to be maintained by human
6. each service and component are treated as a single module that which will have higher level abstraction level, and in which this repo is very strict with atomic design principle


## Packaging

Where it lives: ```/packaging```

Packaging is a directory where we create a workflow that ships the app of the torch inference itself. Currently from what i saw this is all using manual sh, none framework is used, which is bad since this need to be a pipeline ready and platform agnostic, aka this shall not using .sh scripts here. Making this hard to replicate in another environment such as windows to build dmg, and vise versa.

What it need is a workflow framework like ansible to make this CI CD and deployment ready and if, assuming github is down, we can build any release in any device and any place without dependent to any services, framework, or platforms.

## config

please use single type of config file, i dont want this to be a json, so toml or yaml please think and use which one is the best for this repository

## canvas

please update the canvas model to really represent the system blueprint and connections through, this project (later) will be opensourced and the repo will be public

## deployment

we need to find any kind of way to make this app run as a service, since i dont want to manage multiple repository this repository need to be a single monorepo for landing page, video making (demos), and another video making for content creation and marketing, actuall app/engine

btw talking about the app and the engine, we need 2 release, one is for the engine only (backend only), and one is for the full package

## logging

a logging module should comply and up the standard to OWASP, and some of logs still using println, never use that anywhere in this repository

## monitoring

i see prometheus monitoring, this is rather too simple looking stuff, which is fine for the first iteration, but when i see and doing a lot more deep dive to the official https://prometheus.io/docs/prometheus/latest/configuration/configuration/, i need it to be more well prepared and configured to make it production ready, and enterprise ready.

## source code of torch-inference app

i see that allow dead code everywhere, please remove that completely and i dont want any dead code lives in this repository

some kind of linting framework and kind of code practices need to be implemented and configured, like cargo lint and js lint, i see a lot of the code have thousands of line in a single file, max is 500 line of file 

on the API, it need to be folder restructured to be api/schemas, then api/<functionality/category>

any of the test that is not unit testing shall be moved into its own category

auth, i dont see the auth is integrated or used anywhere, this auth will one hundred percent needed for later compiled code to connect to our server to see if the user have login or create account or not in our platform later --> this need requirement gathering

src shall never mixed with any kind of functionality outside the engine and application itself, please put all the performance and benchmark testing in ```/benchmarks```

for the gpu i see this is not supporting a lot stuff, which we need metal, cuda, vulkan, and or amd support configured, run, engineered and having the best tuning for both high throughput and low/idle GPU

going to the core, i see that this is no foldering and whatsoever, each service engine just like direct rust file with no tidy and clean implementation, all image, ort, etc is soo messed up

and i just realize this app have no databases at all so yea we need that database set up for the application

actually i check everything all is just need rework for the file system, and for the code implementation is so bad, no best practices, agents are running just generating bunch of crap code with no style and designs

and for optimization i think all is embedded there shall and never been a dedicated file named with optimization

the security is so thin i can see all vuln in one

and the principle is need to be modular so we dont compile all of the code, only the set up and engine that is needed to be compiled except if user need to use the full capability, in which on each module need some kind of partitions and stuff to be downloaded in flight 

## lisence

personal use is free and fine to use, but for commercial use need lisence and all right served to evint leovonzko

## docker

the dockers shoud be in its own directory not in root

## model registry

this will be reworkded to be the deployed service app, which will have the authentication and a configuration to have so that either can be eddited via endpoint admin or manual edit

## designs

all design need to follow design best practice engineering system, each component need to be atomic, and this need to have a dedicated directory/module that have all the designs

## flow of development

plan driven development is always enforced in this repository, but the plans will be ignored and never pushed to the github for repository cleanliness purposes, if it is about a feature start from a spec, then goes to technical requirements, plan, then code

## docs

docs repository shall be formatted and have its own engine so that we can have a page that just render the docs/ stuff

## Stacks

all stacks need to be free and no limits or highest limit to be have and done, even including the domains