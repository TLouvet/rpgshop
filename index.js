const assetsPath = "./assets"
const items = {
  'simple-sword': {
    name: 'Simple sword',
    type: 'weapon',
    price: 10,
    description: 'A simple sword',
    model: 'rusty-sword.png',
    damage: 10,
  },
  'basic-helmet': {
    name: 'Basic helmet',
    type: 'armor',
    price: 10,
    description: 'A basic helmet',
    model: 'basic-helmet.png',
    armor: 2,
  },
  'small-potion': {
    name: 'Small potion',
    type: 'consumable',
    price: 5,
    description: 'A small potion',
    model: 'health-pot.png',
    effect: 'heal',
    useOn: 'self',
    amount: 50,
  },
  'small-poison': {
    name: 'Small poison',
    type: 'consumable',
    price: 5,
    description: 'A small poison',
    model: 'poison-pot.png',
    effect: 'damage',
    useOn: 'enemy',
    amount: 50,
  },
  'wake-up-potion': {
    name: 'Wake up potion',
    type: 'consumable',
    price: 5,
    description: 'A wake up potion',
    model: 'mana-pot.png',
    effect: 'wake-up',
    useOn: 'self',
  },
  'fire-immunity-potion': {
    name: 'Fire immunity potion',
    type: 'consumable',
    price: 5,
    description: 'A fire immunity potion',
    model: 'health-pot.png',
    effect: 'immunity',
    useOn: 'self',
    element: 'fire',
  },
  'master-key': {
    name: 'Master key',
    type: 'key',
    price: null,
    description: 'A master key',
    model: 'master-key.png',
    effect: 'open',
    opens: 'all',
  },
};

// On suppose qu'on a load nos éléments

class Inventory {
  constructor() {
    this.items = [];
  }

  addItem(itemName, quantity) {
    const itemInInventory = this.items.find(e => e.name === itemName);
    if (itemInInventory) {
      itemInInventory.quantity += quantity;
    } else {
      this.items.push({ name: itemName, quantity });
    }
  }

  removeItem(itemName, quantity) {
    const itemInInventory = this.items.find(e => e.name === itemName);
    if (!itemInInventory) {
      return;
    }

    if (itemInInventory.quantity - quantity <= 0) {
      this.items = this.items.filter(e => e.name !== itemName);
    }
    else {
      itemInInventory.quantity -= quantity;
    }
  }

  getItems() {
    return this.items;
  }

  getItem(name) {
    return this.items.find(e => e.name === name);
  }
}

// 
class Player {
  constructor(money) {
    this.money = money;
    this.inventory = new Inventory();
    this.inventory.addItem('Simple sword', 1);
  }

  getInventory() {
    return this.inventory;
  }
}

class ItemRenderer {
  constructor(item) {
    this.item = item;
  }

  render() {
    const { name, price, model } = this.item;
    const container = document.createElement('div');
    container.classList.add('row');
    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';
    container.style.alignItems = 'center';
    container.id = name.replace(/ /g, '-').toLowerCase();
    container.innerHTML = `
    <span style="display: flex; align-items: center;">
      <img src="${assetsPath}/${model}" alt="" width="48" height="48" />
      <span class="r-name">${name}</span>
    </span>
    <span style="display: flex; align-items: center;">
      ${price ? price : 'Not for sale'}
      ${price ? `<img src="${assetsPath}/coin-single.png" alt="" width="24" height="24" />` : ''}
    </span>
  `;

    return container;
  }

}

class ShopRenderer {
  constructor(shopContext, playerContext) {
    this.shop = shopContext;
    this.player = playerContext;
    this.isPlayingBuying = true;

    document.getElementById('buying-tab').addEventListener('click', () => {
      document.getElementById('selling-tab').classList.remove('action-button-selected');
      document.getElementById('buying-tab').classList.add('action-button-selected');
      this.isPlayingBuying = true;
      this.shop.setSelectedItem(null);
      this.render();
    });

    document.getElementById('selling-tab').addEventListener('click', () => {
      document.getElementById('buying-tab').classList.remove('action-button-selected');
      document.getElementById('selling-tab').classList.add('action-button-selected');
      this.isPlayingBuying = false;
      this.shop.setSelectedItem(null);
      this.render();
    });
  }

  render() {
    this.updatePlayerCoins();

    const container = document.getElementById('items-recap-list-container');
    const itemsToRender = this.isPlayingBuying ? this.shop.getItems() : this.player.getInventory().getItems();
    const documentFragment = new DocumentFragment(); // We use document Fragment to make only one appendChild update to the dom

    if (itemsToRender.length === 0) {
      container.replaceChildren(documentFragment);
      container.innerHTML = 'No items to display';
      return;
    }

    documentFragment.appendChild(this.renderHeaders());
    const hr = document.createElement('hr');
    hr.style.border = '1px solid black';
    documentFragment.appendChild(hr);

    for (const item of itemsToRender) {
      const itemRefined = this.isPlayingBuying ? item : items[`${item.name.toLowerCase().replace(/ /g, '-')}`]
      const renderer = new ItemRenderer(itemRefined);
      const renderedItem = renderer.render(documentFragment)
      documentFragment.appendChild(renderedItem);

      const hr = document.createElement('hr');
      hr.style.border = '1px solid black';

      renderedItem.addEventListener('click', () => {
        const selectedItem = this.shop.getSelectedItem();
        if (selectedItem) {
          document.getElementById(selectedItem.name.replace(/ /g, '-').toLowerCase())?.classList.remove('row-selected');
        }
        this.shop.setSelectedItem(itemRefined);
        renderedItem.classList.add('row-selected');
        this.showItemDetails(itemRefined);
      });

      documentFragment.appendChild(hr);
    }
    // on ne veut pas du dernier hr
    documentFragment.removeChild(documentFragment.lastElementChild);
    this.showItemDetails(this.shop.getSelectedItem());
    container.replaceChildren(documentFragment);
  }

  renderHeaders() {
    const headers = document.createElement('div');
    headers.classList.add('row');
    headers.style.display = 'flex';
    headers.style.justifyContent = 'space-between';
    headers.style.alignItems = 'center';
    headers.style.padding = '10px';
    headers.style.fontWeight = 'bold';
    headers.style.cursor = "default"
    const headersContent = `
      <span style="display: flex; align-items: center;">
        <span>Item</span>
      </span>
      <span style="display: flex; align-items: center;">
        <span>Price</span>
      </span>
    `;
    headers.innerHTML = headersContent;
    return headers;
  }

  showItemDetails(item) {
    const itemDetailsContainer = document.getElementById('item-details-container');

    if (!item) {
      itemDetailsContainer.innerHTML = '';
      return;
    }

    this.shop.setCurrentItemQuantity(1);
    const { name, price, description, model } = item;
    itemDetailsContainer.innerHTML = `
    <div style="padding: 10px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3 style="display: flex; align-items: center; margin-bottom: 5px; margin-top:0;">${name} - ${price}<img
            src="./assets/coin-single.png" alt="" width="24" height="24" /> </h3>
            ${price ? `
            <div style="display: flex; gap: 20px; align-items:center;">
              <span>
                <button id='minus' style="cursor: pointer;">-</button>
                <span id="current-number">1</span>
                <button id='add' style="cursor: pointer;">+</button>
              </span>
              <button id="buy-btn" style="display: flex; align-items: center;">
                ${this.isPlayingBuying ? "Buy" : "Sell"} for 
                <span id='price' style="margin-left: 5px;"> ${price}</span> 
                <img src="./assets/coin-single.png"alt="" width="24" height="24" />
              </button>
            </div>
            ` : ''}
          
      </div>
      <p style='margin-top:0;'>Currently in your inventory: <span id="current-inv">${this.player.getInventory().getItem(name)?.quantity ?? 0}</span></p>
      <div style="display: flex; gap: 20px;">
        <img src="${assetsPath + '/' + model}" alt="" width="64" height="64" />
        <div>
          <p class="card-description">${description}</p>
          <p class="card-description">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad ex amet consequuntur
            nobis tenetur eveniet, consectetur nam, reprehenderit facere quis nulla omnis enim ducimus laudantium
            veritatis odit, molestias tempore cum.</p>
            ${item?.damage ? `<p>Damage: ${item.damage}</p>` : ''}
            ${item?.armor ? `<p>Armor: ${item.armor}</p>` : ''}
            ${item?.element ? `<p>Element: ${item.element}</p>` : ''}
        </div>
      </div>
    </div> `;

    document.getElementById('buy-btn')?.addEventListener('click', () => {
      if (this.isPlayingBuying) {
        this.shop.sell(item, this.player);
        document.getElementById('current-inv').innerHTML = this.player.getInventory().getItem(name).quantity;
      } else {
        const itemInInventory = this.player.getInventory().getItem(name);
        if (itemInInventory.quantity < this.shop.getCurrentItemQuantity()) {
          alert('You do not have enough of this item in your inventory');
          return;
        }

        this.player.money += price * this.shop.getCurrentItemQuantity();
        this.player.getInventory().removeItem(name, this.shop.getCurrentItemQuantity());

        if (this.player.getInventory().getItem(name)) {
          document.getElementById('current-inv').innerHTML = this.player.getInventory().getItem(name).quantity;
        } else {
          itemDetailsContainer.innerHTML = '';
          this.shop.setSelectedItem(null);
          this.render();
        }
      }
      this.updatePlayerCoins();

    });

    document.getElementById('minus')?.addEventListener('click', () => {
      if (this.shop.getCurrentItemQuantity() < 2) {
        return;
      }

      this.shop.setCurrentItemQuantity(this.shop.getCurrentItemQuantity() - 1);
      document.getElementById("current-number").innerHTML = this.shop.getCurrentItemQuantity();
      document.getElementById('price').innerHTML = this.shop.getCurrentItemQuantity() * price;
    });

    document.getElementById('add')?.addEventListener('click', () => {
      this.shop.setCurrentItemQuantity(this.shop.getCurrentItemQuantity() + 1);
      document.getElementById("current-number").innerHTML = this.shop.getCurrentItemQuantity();
      document.getElementById('price').innerHTML = this.shop.getCurrentItemQuantity() * price;
    });
  }

  updatePlayerCoins() {
    const coinsRender = document.getElementById('player-coins');
    coinsRender.innerHTML = this.player.money;
  }
}

class Shop {
  constructor(items, player) {
    this.items = items;
    this.selectedItem = null;
    this.currentItemQuantity = 1;
    this.player = player;
  }

  getItems() {
    return this.items;
  }

  getSelectedItem() {
    return this.selectedItem;
  }

  setSelectedItem(item) {
    this.selectedItem = item;
  }

  getCurrentItemQuantity() {
    return this.currentItemQuantity;
  }

  setCurrentItemQuantity(quantity) {
    this.currentItemQuantity = quantity;
  }

  sell(item, player) {
    const { name, price } = item;
    if (player.money < price * this.currentItemQuantity) {
      alert('Not enough money');
    } else if (this.currentItemQuantity < 1) {
      alert('You need to buy at least 1');
    }
    else {
      player.money -= price * this.currentItemQuantity;
      player.getInventory().addItem(name, this.currentItemQuantity);
    }
  }
}

const player = new Player(400, []);
const shop = new Shop(Object.values(items), player);

// Tout ce qui va toucher au rendu de la boutique est ici
const shopRenderer = new ShopRenderer(shop, player);
shopRenderer.render();
