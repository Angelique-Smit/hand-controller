import { ImageSource, Sound, Resource, Loader } from 'excalibur'

const Resources = {
    Fish: new ImageSource('images/fish.png')
}
const ResourceLoader = new Loader([
    Resources.Fish
])

export { Resources, ResourceLoader }